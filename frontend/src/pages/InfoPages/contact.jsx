import React from "react";
import {
  FaChevronCircleLeft,
  FaPhoneAlt,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

function Contact() {
  const handleBack = () => {
    history.back();
  };

  return (
    <div className="flex flex-col items-center justify-left min-h-screen bg-white text-left px-6">
      <div className="w-screen p-6">
        <FaChevronCircleLeft
          onClick={handleBack}
          color="black"
          size={40}
          cursor={"pointer"}
        />
      </div>
      <img src={`/rect19.png`} alt="Benote Logo" className="w-36 h-auto mb-6" />
      <h1 className="text-2xl text-black font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-black max-w-2xl mb-6">
        We'd love to hear from you! You can reach us through the following
        channels:
      </p>
      <div className="flex flex-row gap-5">
        <div className="flex items-center space-x-4">
          <FaPhoneAlt size={24} color="black" />
          <span className="text-lg">+1 234 567 890</span>
        </div>
        {/* Social Media Icons only */}
        <div className="flex items-center space-x-4">
          <a
            href="https://www.linkedin.com"
            className="text-black hover:text-blue-700"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://www.facebook.com"
            className="text-black hover:text-blue-600"
          >
            <FaFacebook size={24} />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com"
            className="text-black hover:text-gray-800"
          >
            <FaGithub size={24} />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://www.instagram.com"
            className="text-black hover:text-pink-600"
          >
            <FaInstagram size={24} />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://twitter.com"
            className="text-black hover:text-blue-400"
          >
            <FaTwitter size={24} />
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg">Email: support@benote.com</span>
        </div>
      </div>
    </div>
  );
}

export default Contact;
