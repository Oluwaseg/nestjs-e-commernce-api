import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to register partials dynamically
const registerPartials = () => {
  const partialsDir = path.resolve(
    process.cwd(),
    'src',
    'templates',
    'partials',
  );

  if (fs.existsSync(partialsDir)) {
    fs.readdirSync(partialsDir).forEach((file) => {
      const partialName = path.basename(file, '.hbs');
      const partialPath = path.join(partialsDir, file);
      const partialContent = fs.readFileSync(partialPath, 'utf8');
      handlebars.registerPartial(partialName, partialContent);
    });
  } else {
    console.warn('Partials directory does not exist:', partialsDir);
  }
};

const compileTemplate = (
  templateName: string,
  context: { otp?: any; username?: any },
) => {
  registerPartials();

  const baseDir =
    process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, '..', 'templates', 'emails') // Production
      : path.resolve(process.cwd(), 'src', 'templates', 'emails'); // Development (relative to the project root)

  const templatePath = path.join(baseDir, `${templateName}.hbs`);

  try {
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(context);
  } catch (error) {
    console.error('Template not found at:', templatePath); // Log the path of the missing template
    throw error;
  }
};

// Send email function
export const sendOtpEmail = async (email: string, otp: string) => {
  const context = { otp };

  const htmlContent = compileTemplate('verify-email', context); // 'verify-email' is the template name

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: htmlContent, // The compiled Handlebars HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

// Send Welcome email function
export const sendWelcomeEmail = async (email: string, username: string) => {
  const context = { username };

  const htmlContent = compileTemplate('welcome-email', context); // 'welcome-email' is the template name

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Our Platform!',
    html: htmlContent, // The compiled Handlebars HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.response);
  } catch (error) {
    console.error('Error sending Welcome email:', error);
  }
};
