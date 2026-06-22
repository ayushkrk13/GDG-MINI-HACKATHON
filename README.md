# GDG-MINI-HACKATHON
# ExamEdge AI ⚡

**ExamEdge AI** is a premium, highly responsive, and budget-friendly last-minute revision tutor designed specifically for students preparing under the Indian educational systems (CBSE, ICSE, and various State Boards). 

Built as a serverless, single-page application using modern vanilla HTML, CSS, and JavaScript, it offers comprehensive exam prep features—including personalized planners, syllabus unit analysis, MCQ tests, doubt solvers, and interactive flashcards—while operating with **zero maintenance costs**.

---

## 💡 The Low-Budget Architecture (Zero Paid APIs)

This project was developed with a strict focus on **low-budget accessibility**. It operates entirely client-side, eliminating the need for expensive backend servers, databases, or subscription-based AI API calls:

1. **Default Offline / Mock Mode**: 
   ExamEdge AI is fully operational out-of-the-box using a comprehensive, locally compiled revision database. It handles key subjects (Photosynthesis, Newton's Laws, Quadratic Equations, History, etc.) offline, providing instant response feedback with zero API costs.
2. **Free-Tier Live AI Integration**: 
   For custom topics, the app supports live AI queries via **Google Gemini API**. Students or developers can insert their own free-tier API keys directly from the in-app settings modal. The key is stored safely in `localStorage` and called directly from the browser, keeping hosting and API overhead at exactly **$0.00**.
3. **Serverless Deployment**: 
   Since the app consists of static files (`3.html`, `3.css`, `3.js`), it can be hosted for free on platforms like GitHub Pages, Vercel, or Netlify with no database subscription fees.

---

## ✨ Key Features

* 🎓 **Indian Curriculum Profile Onboarding**: Automatically customizes revision strategies and vocabulary to the student's selected Grade (Class 6 to College/JEE/NEET), Board (CBSE/ICSE/State Boards), and Medium of Instruction (English/Hindi/Regional).
* 📅 **Custom Study Planner**: Instantly formulates step-wise revision roadmaps based on timelines (24-Hour Express, 3-Day Focus, or 7-Day Complete).
* 🎯 **Unit-wise Exam Insights**: Analyzes any syllabus unit (e.g., "Nationalism in India") and identifies high-probability exam topics, probability priority rankings, and most expected board questions.
* 🤔 **Doubt Solver**: Explains complex scientific or humanities concepts using everyday real-life analogies and curriculum-focused exam tips.
* 📝 **Adaptive Quick Tests**: Dynamically generates MCQ quizzes on chosen topics with auto-evaluation, color-coded answers, and detailed rationales.
* 📚 **Revision Resources Finder**: Recommends top YouTube summary videos, SlideShare PPT slides, NCERT PDF notes, and official course links.
* ✍️ **Multi-Format Summarizer**: Instantly outputs 60-second briefs, detailed revision sheets, chapter outlines, comparison tables, or text-based mind maps.
* 🃏 **AI Flashcards**: Interactive flip-cards with tap-to-reveal answers for rapid memorization.
* 💬 **Advanced Footer Feedback**: Includes a feedback submission form and a custom-designed, animated CSS graduation mascot that blinks, bounces, and encourages students.

---

## 🎨 Design & Aesthetics

The application follows premium modern web design practices:
* **Curated Warm Palette**: Built on a vintage/warm paper aesthetic (`#f5f2eb`) to reduce eye strain during late-night revision sessions.
* **Modern Typography**: Powered by Google Fonts (*Bricolage Grotesque* and *Instrument Sans*) for optimal hierarchy.
* **Micro-animations**: Subtle CSS keyframe animations (fade-up cards, bouncing mascot, blinking cursor, and button scales) that make the application feel alive and premium.
* **Responsive Layout**: Designed to adapt fluidly across mobile phones, tablets, and desktop monitors.

---

## 🚀 How to Run Locally

Since the application requires no database or backend compilation step, running it locally is extremely simple.

### Method 1: Python HTTP Server (Recommended)
1. Clone or download the repository files into a directory.
2. Open your terminal in the directory and run:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000/3.html`.

### Method 2: VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Click the **Go Live** button at the bottom-right of the window.

## 👤 Developer Info
* **Name**: Ayush Kumar Raunak
* **Education**: Sagar Institute of Research & Technology (SIRT), Bhopal (B.Tech CSE, First Year)
* **Email**: ayushkumarraunak6@gmail.com
