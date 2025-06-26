// Store submissions in memory for demo purposes
const submissions = [];

exports.submitContact = (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and message'
    });
  }

  // Create new submission
  const newSubmission = {
    id: submissions.length + 1,
    name,
    email,
    subject: subject || '',
    message,
    submittedAt: new Date(),
    status: 'new'
  };

  // Save submission
  submissions.push(newSubmission);

  // Log the submission (since we're not using a real database)
  console.log('New Contact Form Submission:', newSubmission);

  // Return success response
  res.json({
    success: true,
    message: 'Thank you for your message. We will get back to you soon!',
    data: {
      id: newSubmission.id,
      submittedAt: newSubmission.submittedAt
    }
  });
};

// Get all submissions (for admin purposes)
exports.getSubmissions = (req, res) => {
  res.json({
    success: true,
    data: submissions
  });
};

// For internal use by controllers
exports.getAllSubmissions = () => submissions;
