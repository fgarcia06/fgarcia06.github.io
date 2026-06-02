\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{{#1 \vspace{-2pt}}}
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape Francis Garcia} \\ \vspace{1pt}
    \small 403-550-7058 $|$
    \href{mailto:fgarcia@ualberta.ca}{\underline{fgarcia@ualberta.ca}} $|$
    \href{https://linkedin.com/in/fgarcia06}{\underline{linkedin.com/in/fgarcia06}} $|$
    \href{https://github.com/fgarcia06}{\underline{github.com/fgarcia06}}
\end{center}

%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {University of Alberta}{Edmonton, AB}
      {Bachelor of Science in Computer Engineering}{Sept. 2021 -- April 2026}
  \resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart

    \resumeSubheading
      {TRICCA Technologies}{Edmonton, AB}
      {Junior Robotics Engineer}{Jan. 2024 -- Dec. 2025}
      \resumeItemListStart
        \resumeItem{Delivered a production-ready automated pipetting system for a University of Alberta chemistry lab, eliminating all manual liquid-handling steps and achieving full regulatory sign-off}
        \resumeItem{Engineered Python and C++ control modules over I2C, SPI, GPIO, and serial protocols integrated with a Klipper/Moonraker/Mainsail firmware stack to drive real-time robotic actuator control}
        \resumeItem{Reduced QA cycle time by 60\% by building automated Python test pipelines that execute full lab protocols and validate positional accuracy and pipetting correctness against defined acceptance criteria}
        \resumeItem{Enabled browser-based remote operation for 3 lab technicians by shipping a full-stack web app (PyShiny, REST API, HTML/CSS) with a responsive, mobile-first UI built on a customized KlipperScreen interface}
        \resumeItem{Accelerated hardware iteration by designing custom mechanical components in Fusion 360 and fabricating them in-house on a 3D printer, removing third-party part dependencies from the build cycle}
      \resumeItemListEnd

    \resumeSubheading
      {University of Alberta --- Research Lab}{Edmonton, AB}
      {Process Control Lab Assistant}{May 2023 -- Aug. 2023}
      \resumeItemListStart
        \resumeItem{Achieved \textless{}5\% model error by implementing a SINDy pipeline in Python to reconstruct governing ODEs from experimental time-series sensor data}
        \resumeItem{Improved closed-loop control fidelity by applying Kalman filtering, PID tuning, and MPC in Python, reducing the simulated-to-physical system discrepancy and validating updated parameters across benchmark datasets}
        \resumeItem{Prototyped reinforcement learning and transformer-based models in TensorFlow to evaluate data-driven approaches to dynamic system identification and control}
        \resumeItem{Maintained stakeholder alignment by delivering structured weekly reports and standup slides covering experimental results, model metrics, and recommended next steps}
      \resumeItemListEnd

  \resumeSubHeadingListEnd

%-----------PROJECTS-----------
\section{Projects}
    \resumeSubHeadingListStart

      \resumeProjectHeading
          {\textbf{AI Fitness Coaching App} $|$ \emph{React Native, TypeScript, Next.js, Supabase, OpenAI API}}{Jan. 2026 -- Apr. 2026}
          \resumeItemListStart
            \resumeItem{Reduced onboarding friction by designing a responsive cross-platform UI (iOS/Android) in React Native (Expo) with TypeScript, backed by Supabase JWT authentication}
            \resumeItem{Eliminated client-side API key exposure by architecting a secure Next.js backend proxy for all OpenAI calls, enabling dynamic workout-plan generation that adapts to logged user performance data}
            \resumeItem{Improved plan personalization over time by engineering a closed-loop data pipeline that persists session metrics to PostgreSQL and queries prior performance each generation cycle to drive progressive overload recommendations}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Real-Time Multi-Object Tracking System} $|$ \emph{Python, TensorFlow, OpenCV, NumPy}}{May 2023 -- Aug. 2023}
          \resumeItemListStart
            \resumeItem{Maintained stable identity across 10+ simultaneous objects by implementing a Kalman filter tracker in Python/NumPy that fuses bounding-box detections with motion state estimates}
            \resumeItem{Achieved \textgreater{}92\% detection mAP on benchmark test sets by integrating a YOLOv5 inference pipeline with a TensorFlow/ONNX backend into the end-to-end tracking system}
            \resumeItem{Reduced end-to-end pipeline latency by $\sim$50\% on 60\,fps streams by profiling the full decode $\rightarrow$ inference $\rightarrow$ track $\rightarrow$ display loop and applying batched inference and adaptive frame-skipping}
          \resumeItemListEnd

    \resumeSubHeadingListEnd

%-----------SKILLS-----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
  \small{\item{
    \textbf{Languages}{: Python, C++, C, Java, JavaScript, TypeScript, SQL, MATLAB} \\
    \textbf{Frameworks \& Libraries}{: React Native (Expo), Next.js, Node.js, TensorFlow, OpenCV, NumPy, Pandas} \\
    \textbf{Embedded \& Hardware}{: Arduino, Raspberry Pi, I2C/SPI/UART, GPIO, PWM, Klipper, Fusion 360, 3D printing} \\
    \textbf{Backend \& Databases}{: Supabase, PostgreSQL, REST APIs, JWT auth, secure API proxy design} \\
    \textbf{DevOps \& Tools}{: Git/GitHub, Linux, CI/CD, Jupyter, Anaconda, VS Code, Android Studio} \\
    \textbf{AI \& ML}{: YOLO, TensorFlow/ONNX, Kalman filtering, MPC, SINDy, RL, LLM API integration (OpenAI, Claude)}
  }}
\end{itemize}

\end{document}