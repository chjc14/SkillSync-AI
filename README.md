SkillSync AI: Strategic Career Architect
Developed by Team: Machine Minds
Live Application: https://skillsync-ai-project.web.app

🚀 Project Vision
SkillSync AI is a professional-grade technical mentor designed to bridge the gap between candidate potential and job market requirements. Unlike traditional ATS scanners that focus on rejection, SkillSync AI performs a Technical Audit to provide an encouraging, actionable growth roadmap for developers.

🛠️ The Tech Stack
Intelligence Engine: Dual-AI Sync featuring Google Gemini 1.5 Flash (Primary) and Groq Llama 3 (Failover).

Backend Infrastructure: Firebase Auth for identity management and Cloud Firestore for persistent analysis history.

Frontend Architecture: Responsive UI built with Tailwind CSS.

Document Processing: PDF.js for high-accuracy client-side resume parsing.

✨ Key Features
Resilient AI Logic: Implements a sophisticated failover system that rotates API providers to ensure 100% uptime for the Analysis Workspace.

Encouraging Match Meter: Uses high-reasoning AI to recognize foundational parallels in experience, providing a "Potential Match" score rather than a strict keyword rejection.

Project Depth Audit: Tiers existing projects (Beginner/Intermediate/Advanced) and suggests professional-grade "Level-Up" features.

7-Day Learning Sprint: Generates a targeted "Learning-by-Doing" project strategy based specifically on identified skill gaps.

🛡️ Security & Architecture
This repository follows industry-standard security protocols to protect sensitive credentials:

Modular Configuration: API keys and Firebase settings are isolated in a non-tracked config.js file.

Shielded Credentials: The project utilizes a .gitignore policy to ensure production keys never leak into the public version history.

Template Pattern: A config.example.js is provided to allow for easy collaboration without compromising security.

⚙️ Local Setup
To run this project locally:

Clone the repository.

Navigate to the public/ directory.

Rename config.example.js to config.js.

Insert your own Gemini and Groq API keys into the apiKeys array.

Update the firebaseConfig with your project credentials.

Open index.html in your browser.
