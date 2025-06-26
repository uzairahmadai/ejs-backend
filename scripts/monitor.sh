#!/bin/bash

# Configuration
APP_NAME="autovault"
MONITOR_INTERVAL=60  # seconds
LOG_DIR="logs/monitoring"
ALERT_THRESHOLD_CPU=80  # percentage
ALERT_THRESHOLD_MEMORY=80  # percentage
ALERT_THRESHOLD_DISK=90  # percentage
TIMESTAMP=$(date +"%Y%m%d")

# Create log directory
mkdir -p $LOG_DIR

# Log file
LOG_FILE="$LOG_DIR/monitor_${TIMESTAMP}.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to check system resources
check_resources() {
    # CPU Usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    
    # Memory Usage
    MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100}' | cut -d. -f1)
    
    # Disk Usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d% -f1)
    
    # Docker container stats
    CONTAINER_STATS=$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}")
    
    # Log resource usage
    log_message "System Resources:"
    log_message "CPU Usage: ${CPU_USAGE}%"
    log_message "Memory Usage: ${MEMORY_USAGE}%"
    log_message "Disk Usage: ${DISK_USAGE}%"
    log_message "\nContainer Stats:\n$CONTAINER_STATS"
    
    # Check for alerts
    if [ $CPU_USAGE -gt $ALERT_THRESHOLD_CPU ]; then
        log_message "ALERT: High CPU usage detected!"
    fi
    
    if [ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ]; then
        log_message "ALERT: High memory usage detected!"
    fi
    
    if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
        log_message "ALERT: High disk usage detected!"
    fi
}

# Function to check application health
check_health() {
    # Application health check
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    
    if [ "$HEALTH_STATUS" == "200" ]; then
        log_message "Application health check: OK"
    else
        log_message "ALERT: Application health check failed! Status: $HEALTH_STATUS"
    fi
    
    # Check MongoDB connection
    MONGO_STATUS=$(docker exec autovault-mongodb mongosh --eval "db.runCommand('ping').ok" --quiet)
    
    if [ "$MONGO_STATUS" == "1" ]; then
        log_message "MongoDB connection: OK"
    else
        log_message "ALERT: MongoDB connection failed!"
    fi
    
    # Check Redis connection
    REDIS_STATUS=$(docker exec autovault-redis redis-cli ping)
    
    if [ "$REDIS_STATUS" == "PONG" ]; then
        log_message "Redis connection: OK"
    else
        log_message "ALERT: Redis connection failed!"
    fi
}

# Function to check logs for errors
check_logs() {
    # Check application logs for errors
    ERROR_COUNT=$(docker logs autovault-app --since 1m 2>&1 | grep -i "error" | wc -l)
    
    if [ $ERROR_COUNT -gt 0 ]; then
        log_message "ALERT: Found $ERROR_COUNT error(s) in application logs"
        log_message "Recent errors:"
        docker logs autovault-app --since 1m 2>&1 | grep -i "error" | tail -5 >> $LOG_FILE
    fi
}

# Function to generate monitoring report
generate_report() {
    REPORT_FILE="$LOG_DIR/report_${TIMESTAMP}.html"
    
    # Create HTML report
    cat << EOF > $REPORT_FILE
<!DOCTYPE html>
<html>
<head>
    <title>Monitoring Report - $APP_NAME</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert { color: red; font-weight: bold; }
        .ok { color: green; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Monitoring Report - $APP_NAME</h1>
    <p>Generated: $(date)</p>
    
    <h2>System Resources</h2>
    <table>
        <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
        <tr>
            <td>CPU Usage</td>
            <td>${CPU_USAGE}%</td>
            <td class="$([ $CPU_USAGE -gt $ALERT_THRESHOLD_CPU ] && echo 'alert' || echo 'ok')">
                $([ $CPU_USAGE -gt $ALERT_THRESHOLD_CPU ] && echo 'HIGH' || echo 'OK')
            </td>
        </tr>
        <tr>
            <td>Memory Usage</td>
            <td>${MEMORY_USAGE}%</td>
            <td class="$([ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ] && echo 'alert' || echo 'ok')">
                $([ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ] && echo 'HIGH' || echo 'OK')
            </td>
        </tr>
        <tr>
            <td>Disk Usage</td>
            <td>${DISK_USAGE}%</td>
            <td class="$([ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ] && echo 'alert' || echo 'ok')">
                $([ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ] && echo 'HIGH' || echo 'OK')
            </td>
        </tr>
    </table>
    
    <h2>Container Status</h2>
    <pre>$CONTAINER_STATS</pre>
    
    <h2>Recent Errors</h2>
    <pre>$(tail -n 10 $LOG_FILE | grep "ALERT")</pre>
</body>
</html>
EOF

    log_message "Generated monitoring report: $REPORT_FILE"
}

# Main monitoring loop
log_message "Starting monitoring for $APP_NAME"
log_message "Monitoring interval: ${MONITOR_INTERVAL} seconds"
log_message "Log file: $LOG_FILE"

while true; do
    check_resources
    check_health
    check_logs
    generate_report
    
    log_message "-----------------------------------"
    sleep $MONITOR_INTERVAL
done
