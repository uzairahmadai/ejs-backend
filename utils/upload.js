const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const { FileUploadError } = require('./errors');
const logger = require('./logger');

class FileUpload {
    constructor() {
        this.uploadDir = path.join(__dirname, '../public/uploads');
        this.tempDir = path.join(this.uploadDir, 'temp');
        
        // Ensure upload directories exist
        this.initializeDirectories();
        
        // Configure multer storage
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.tempDir);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            }
        });

        // Configure multer upload
        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: config.upload.maxFileSize
            },
            fileFilter: this.fileFilter.bind(this)
        });
    }

    /**
     * Initialize upload directories
     */
    async initializeDirectories() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.tempDir, { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'cars'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'profiles'), { recursive: true });
            await fs.mkdir(path.join(this.uploadDir, 'blog'), { recursive: true });
        } catch (error) {
            logger.error('Error creating upload directories:', error);
            throw new FileUploadError('Failed to initialize upload directories');
        }
    }

    /**
     * File filter for multer
     * @param {Object} req - Express request object
     * @param {Object} file - File object
     * @param {Function} cb - Callback function
     */
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!config.upload.allowedTypes.includes(ext.substring(1))) {
            return cb(new FileUploadError(`File type ${ext} is not allowed`));
        }
        cb(null, true);
    }

    /**
     * Process image upload
     * @param {Object} file - Uploaded file
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processed file info
     */
    async processImage(file, options = {}) {
        const {
            width,
            height,
            quality = 80,
            format = 'jpeg',
            destination
        } = options;

        try {
            const filename = `${path.parse(file.filename).name}.${format}`;
            const outputPath = path.join(destination, filename);

            let imageProcess = sharp(file.path);

            if (width || height) {
                imageProcess = imageProcess.resize(width, height, {
                    fit: 'cover',
                    withoutEnlargement: true
                });
            }

            await imageProcess
                .toFormat(format, { quality })
                .toFile(outputPath);

            // Delete temporary file
            await fs.unlink(file.path);

            return {
                filename,
                path: outputPath,
                size: (await fs.stat(outputPath)).size,
                mimetype: `image/${format}`
            };
        } catch (error) {
            logger.error('Image processing error:', error);
            throw new FileUploadError('Failed to process image');
        }
    }

    /**
     * Upload car images
     * @param {string} field - Form field name
     * @returns {Function} Express middleware
     */
    carImages(field) {
        return async (req, res, next) => {
            try {
                const upload = this.upload.array(field, 10);

                upload(req, res, async (err) => {
                    if (err) {
                        return next(new FileUploadError(err.message));
                    }

                    if (!req.files || req.files.length === 0) {
                        return next(new FileUploadError('No files uploaded'));
                    }

                    const processedFiles = [];
                    const destination = path.join(this.uploadDir, 'cars');

                    for (const file of req.files) {
                        // Create thumbnail
                        const thumbnail = await this.processImage(file, {
                            width: 300,
                            height: 200,
                            destination,
                            prefix: 'thumb_'
                        });

                        // Create main image
                        const mainImage = await this.processImage(file, {
                            width: 1200,
                            height: 800,
                            destination
                        });

                        processedFiles.push({
                            original: mainImage,
                            thumbnail
                        });
                    }

                    req.processedFiles = processedFiles;
                    next();
                });
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Upload profile image
     * @param {string} field - Form field name
     * @returns {Function} Express middleware
     */
    profileImage(field) {
        return async (req, res, next) => {
            try {
                const upload = this.upload.single(field);

                upload(req, res, async (err) => {
                    if (err) {
                        return next(new FileUploadError(err.message));
                    }

                    if (!req.file) {
                        return next(new FileUploadError('No file uploaded'));
                    }

                    const destination = path.join(this.uploadDir, 'profiles');
                    const processedFile = await this.processImage(req.file, {
                        width: 300,
                        height: 300,
                        destination
                    });

                    req.processedFile = processedFile;
                    next();
                });
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Upload blog image
     * @param {string} field - Form field name
     * @returns {Function} Express middleware
     */
    blogImage(field) {
        return async (req, res, next) => {
            try {
                const upload = this.upload.single(field);

                upload(req, res, async (err) => {
                    if (err) {
                        return next(new FileUploadError(err.message));
                    }

                    if (!req.file) {
                        return next(new FileUploadError('No file uploaded'));
                    }

                    const destination = path.join(this.uploadDir, 'blog');
                    const processedFile = await this.processImage(req.file, {
                        width: 1200,
                        destination
                    });

                    req.processedFile = processedFile;
                    next();
                });
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Delete uploaded file
     * @param {string} filepath - Path to file
     * @returns {Promise<void>}
     */
    async deleteFile(filepath) {
        try {
            await fs.unlink(filepath);
        } catch (error) {
            logger.error('Error deleting file:', error);
            throw new FileUploadError('Failed to delete file');
        }
    }

    /**
     * Clean temporary files
     * @returns {Promise<void>}
     */
    async cleanTemp() {
        try {
            const files = await fs.readdir(this.tempDir);
            await Promise.all(
                files.map(file => 
                    fs.unlink(path.join(this.tempDir, file))
                )
            );
        } catch (error) {
            logger.error('Error cleaning temp files:', error);
            throw new FileUploadError('Failed to clean temporary files');
        }
    }
}

// Export singleton instance
module.exports = new FileUpload();
