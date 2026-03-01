
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


%----------FONT OPTIONS----------
% sans-serif
% \usepackage[sfdefault]{FiraSans}
% \usepackage[sfdefault]{roboto}
% \usepackage[sfdefault]{noto-sans}
% \usepackage[default]{sourcesanspro}

% serif
% \usepackage{CormorantGaramond}
% \usepackage{charter}


\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\begin{document}

%----------HEADING----------
% \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
%   \textbf{\href{http://sourabhbajaj.com/}{\Large Sourabh Bajaj}} & Email : \href{mailto:sourabh@sourabhbajaj.com}{sourabh@sourabhbajaj.com}\\
%   \href{http://sourabhbajaj.com/}{http://www.sourabhbajaj.com} & Mobile : +1-123-456-7890 \\
% \end{tabular*}

\begin{center}
    \textbf{\Huge \scshape Francis Garcia} \\ \vspace{1pt}
    \small 403-550-7058 $|$ \href{mailto:x@x.com}{\underline{fgarcia@ualberta.ca}} $|$ 
    \href{https://linkedin.com/in/fgarcia06}{\underline{linkedin.com/in/fgarcia06}} $|$
    \href{https://github.com/fgarcia06}{\underline{github.com/fgarcia06}}
\end{center}


%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {University of Alberta}{Edmonton, AB}
      {Bachelor of Science in Computer Engineering - Software Co-op Option}{Sept. 2021 - April 2026}
    \small{\item{
     \textbf{Relevant Coursework}{: Software Requirements Engineering, Software Testing and Maintenance Engineering, Software Systems Design, Operating System Concepts, Computer Organization and Architecture, Computer Interfacing, Data Communication Networks, Introduction to Microprocessors, Introduction to Software Engineering, Engineering Safety and Risk Management, Reliable and Secure Systems Design, Introductory Statistics for Engineering}
 \\
 \resumeSubHeadingListEnd


%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart

    \resumeSubheading
      {Software Intern}{January 2024 -- August 2024, May 2025 -- December 2025}
      {TRICCA Technologies}{Edmonton, AB}
      \resumeItemListStart
        \resumeItem{Designed and implemented software components in Python and C++ to control and automate laboratory robotic workflows}
        \resumeItem{Developed structured test cases and quantitative evaluation methods to measure accuracy, repeatability, and system performance}
        \resumeItem{Collected, analyzed, and interpreted test data using Python, Excel, and Google Sheets to identify trends and assess system readiness}
        \resumeItem{Executed verification and validation activities by running real assay workflows in collaboration with chemistry stakeholders}
        \resumeItem{Applied iterative Agile-style development by collecting user feedback, prioritizing issues, and refining system behavior across testing cycles}
        \resumeItem{Built and configured laboratory test setups to support integration, verification, and validation of hardware and software components}

      \resumeItemListEnd
      
% -----------Multiple Positions Heading-----------
%    \resumeSubSubheading
%     {Software Engineer I}{Oct 2014 - Sep 2016}
%     \resumeItemListStart
%        \resumeItem{Apache Beam}
%          {Apache Beam is a unified model for defining both batch and streaming data-parallel processing pipelines}
%     \resumeItemListEnd
%    \resumeSubHeadingListEnd
%-------------------------------------------

    \resumeSubheading
      {Process Control Lab Assistant}{May 2023 -- August 2023}
      {University of Alberta}{Edmonton, AB}
      \resumeItemListStart
      \resumeItem{Supported system design and analysis for a real-time experimental control system in collaboration with a multidisciplinary team}
      \resumeItem{Applied system identification techniques (SINDy) in Python to model and evaluate dynamic system behavior}
      \resumeItem{Performed technical analysis on experimental results to validate system performance against expected outcomes}
      \resumeItem{Prepared technical reports and presentations to communicate findings, design rationale, and validation results}
    \resumeItemListEnd

  \resumeSubHeadingListEnd


%-----------PROJECTS-----------
\section{Projects}
    \resumeSubHeadingListStart
      \resumeProjectHeading
          {\textbf{Lottery Event Android Mobile App} $|$ \emph{Java, C++, Android Studios}}{October 2024 -- December 2024}
          \resumeItemListStart
            \resumeItem{Engineered a full-stack Android application for managing lottery events, integrating Google Firebase for real-time data synchronization and user management}
            \resumeItem{Designed and optimized the UI/UX using XML and OSMdroid, enabling interactive location-based features for an enhanced user experience}
            \resumeItem{Implemented robust unit and UI testing with JUnit and Espresso, ensuring a bug-free and scalable application}
          \resumeItemListEnd
      \resumeProjectHeading
          {\textbf{Object Tracking for Camera} $|$ \emph{Python, C++, Github, VS Code, Tensorflow}}{May 2023 -- August 2023}
          \resumeItemListStart
            \resumeItem{Enhanced object tracking precision by implementing a Kalman filter, significantly improving motion prediction and stability in occlusion scenarios}
            \resumeItem{Integrated a YOLO deep learning model with TensorFlow, achieving high-accuracy real-time object identification in dynamic environments}
            \resumeItem{Optimized real-time system performance, resulting in a 50\% reduction in latency while processing high-frame-rate video streams, ensuring near-instantaneous updates}
          \resumeItemListEnd
    \resumeSubHeadingListEnd


%
%-----------PROGRAMMING SKILLS-----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
  \small{\item{
    \textbf{Programming Languages}{: Python, C, C++, Java, Bash, SQL, MATLAB, Assembly} \\
    \textbf{Systems \& Environments}{: Linux, Embedded Systems, Microcontrollers, Android} \\
    \textbf{Tools}{: Git, VS Code, Vim, PyCharm, Android Studio, Eclipse} \\
\end{itemize}



%-------------------------------------------
\end{document}
