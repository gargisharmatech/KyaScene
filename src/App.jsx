import { useState } from "react";
import "./App.css";
import studentChaos from "./assets/student-chaos.png";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [page, setPage] = useState("landing");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [exploreCategory, setExploreCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(15);

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleIntroEnd = (event) => {
    if (
      event.target === event.currentTarget &&
      event.animationName === "introExit"
    ) {
      setShowIntro(false);
    }
  };

  return (
    <div className="app">

      {/* ================= INTRO STORY ================= */}

      {showIntro && (
        <div
          className="intro-screen"
          onAnimationEnd={handleIntroEnd}
        >
          <div className="story-notification notification-1">
            🔔 Hackathon Registration
          </div>

          <div className="story-notification notification-2">
            📢 Club Event
          </div>

          <div className="story-notification notification-3">
            ⏰ Deadline Tomorrow
          </div>

          <div className="story-notification notification-4">
            📚 Academic Notice
          </div>

          <div className="story-notification notification-5">
            💬 Society Update
          </div>

          <img
            src={studentChaos}
            alt="Student overwhelmed by campus notifications"
            className="student-chaos"
          />

          <div className="problem-text">
            <p>Too much information.</p>
            <strong>Too little clarity.</strong>
          </div>

          <div className="brand-reveal">
            <span>kya</span>Scene
          </div>
        </div>
      )}

      {/* ================= LANDING PAGE ================= */}

      {!showIntro && page === "landing" && (
        <div className="landing-page">

          <p className="welcome-text">
            WELCOME TO
          </p>

          <h1 className="logo">
            kya<span>Scene</span>
          </h1>

          <p className="tagline">
            Know the scene. Don't miss the moment.
          </p>

          <div className="role-container">

            {/* STUDENT */}

            <div className="role-card">

              <div className="role-icon">
                🎓
              </div>

              <h2>
                I'm a Student
              </h2>

              <p>
                Stay updated with what matters on campus.
              </p>

              <button
                onClick={() => setPage("student-login")}
              >
                Continue →
              </button>

            </div>

            {/* ORGANIZATION */}

            <div className="role-card">

              <div className="role-icon">
                📢
              </div>

              <h2>
                I'm an Organization
              </h2>

              <p>
                Share events, opportunities and announcements.
              </p>

              <button>
                Continue →
              </button>

            </div>

          </div>

          <p className="bottom-text">
            One campus. Less chaos.
          </p>

        </div>
      )}

      {/* ================= STUDENT LOGIN ================= */}

      {!showIntro && page === "student-login" && (
        <div className="onboarding-page">

          <div className="onboarding-card">

            <div className="onboarding-logo">
              kya<span>Scene</span>
            </div>

            <p className="step-text">
              STEP 1 OF 2
            </p>

            <h1>
              Hey! Let’s get you set up 👋
            </h1>

            <p className="onboarding-subtitle">
              Just a couple of things before you dive into kyaScene.
            </p>

            <div className="input-group">

              <label>
                College ID
              </label>

              <input
                type="text"
                placeholder="Enter your college ID"
              />

            </div>

            <div className="input-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
              />

              <small>
                Demo login for now ✨
              </small>

            </div>

            <button
              className="onboarding-button"
              onClick={() => setPage("interests")}
            >
              Continue →
            </button>

            <button
              className="back-button"
              onClick={() => setPage("landing")}
            >
              ← Back
            </button>

          </div>

        </div>
      )}

      {/* ================= INTERESTS ================= */}

      {!showIntro && page === "interests" && (
        <div className="onboarding-page">

          <div className="onboarding-card interests-card">

            <div className="onboarding-logo">
              kya<span>Scene</span>
            </div>

            <p className="step-text">
              STEP 2 OF 2
            </p>

            <h1>
              Okay, what are you into? 👀
            </h1>

            <p className="onboarding-subtitle">
              Pick whatever sounds like you. You can always change it later.
            </p>

            <div className="interest-grid">

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Hackathons")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Hackathons")}
              >
                💻 Hackathons
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("AI / ML")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("AI / ML")}
              >
                🤖 AI / ML
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Cybersecurity")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Cybersecurity")}
              >
                🔐 Cybersecurity
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Design")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Design")}
              >
                🎨 Design
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Competitions")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Competitions")}
              >
                🏆 Competitions
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Internships")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Internships")}
              >
                💼 Internships
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Clubs & Societies")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Clubs & Societies")}
              >
                📢 Clubs & Societies
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Events")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Events")}
              >
                🎤 Events
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Academics")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Academics")}
              >
                📚 Academics
              </button>

              <button
                className={`interest-chip ${
                  selectedInterests.includes("Volunteering")
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleInterest("Volunteering")}
              >
                🌱 Volunteering
              </button>

            </div>

            <button
              className="onboarding-button"
              onClick={() => setPage("student-home")}
            >
              Build my kyaScene →
            </button>

            <button
              className="back-button"
              onClick={() => setPage("student-login")}
            >
              ← Back
            </button>

          </div>

        </div>
      )}

      {/* ================= STUDENT HOME ================= */}

      {!showIntro && page === "student-home" && (
        <div className="student-home">

          <header className="home-header">

            <div>
              <p className="home-greeting">
                Good morning, Student 👋
              </p>

              <h1>
                Here’s what needs your attention.
              </h1>
            </div>

            <button className="notification-button">
              🔔
            </button>

          </header>

          {/* NEEDS YOUR ATTENTION */}

          <section className="home-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="section-dot"></span>
                <h2>Needs Your Attention</h2>
              </div>

              <span className="section-count">
                2
              </span>

            </div>

            <div className="announcement-card urgent-card">

              <div className="card-top">

                <span className="category-tag">
                  HACKATHON
                </span>

                <span className="deadline-tag">
                  Tomorrow
                </span>

              </div>

              <h3>
                Hackathon Registration
              </h3>

              <p>
                Registration closes tomorrow. Don't miss your chance to participate.
              </p>

              <div className="card-info-row">
                <span>📍 IGDTUW</span>
                <span>⏰ Deadline tomorrow</span>
              </div>

              <button className="card-action">
                Register now <span>→</span>
              </button>

            </div>

            <div className="announcement-card urgent-card">

              <div className="card-top">

                <span className="category-tag academic-tag">
                  ACADEMICS
                </span>

                <span className="deadline-tag today-tag">
                  Today
                </span>

              </div>

              <h3>
                Academic Form Submission
              </h3>

              <p>
                Your form needs to be submitted before the deadline.
              </p>

              <div className="card-info-row">
                <span>📚 Academics</span>
                <span>⏰ 11:59 PM</span>
              </div>

              <button className="card-action">
                Submit form <span>→</span>
              </button>

            </div>

          </section>

          {/* COMING UP */}

          <section className="home-section coming-up-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="calendar-dot">📅</span>
                <h2>Coming Up</h2>
              </div>

              <button className="see-all-button">
                See all →
              </button>

            </div>

            <div className="upcoming-list">

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>14</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>ACM Orientation</h3>
                  <p>Today • 4:00 PM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>15</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>Cybersecurity Workshop</h3>
                  <p>Tomorrow • 2:00 PM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>18</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>Freshers' Sports Meet</h3>
                  <p>18 Sep • 10:00 AM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

            </div>

          </section>

          {/* BOTTOM NAVIGATION */}

          <nav className="bottom-nav">

            <button
              className={`nav-item ${
                page === "student-home" ? "active" : ""
              }`}
              onClick={() => setPage("student-home")}
            >
              <span>⌂</span>
              <small>Home</small>
            </button>

            <button
              className={`nav-item ${
                page === "explore" ? "active" : ""
              }`}
              onClick={() => setPage("explore")}
            >
              <span>⌕</span>
              <small>Explore</small>
            </button>

            <button
              className="nav-item ai-nav"
              onClick={() => setPage("ai")}
            >
              <span>✦</span>
              <small>AI</small>
            </button>

            <button
              className="nav-item"
              onClick={() => setPage("calendar")}
            >
              <span>▣</span>
              <small>Calendar</small>
            </button>

            <button
              className="nav-item"
              onClick={() => setPage("profile")}
            >
              <span>♙</span>
              <small>Profile</small>
            </button>

          </nav>

        </div>
      )}

      {/* ================= EXPLORE ================= */}

{!showIntro && page === "explore" && (
  <div className="app-page explore-page">

    {/* ================= CATEGORY SCREEN ================= */}

    {exploreCategory !== null ? (
      <>
        <header className="category-page-header">

          <button
            className="back-to-explore"
            onClick={() => setExploreCategory(null)}
          >
            ← Back to Explore
          </button>

          <p className="eyebrow">
            EXPLORE
          </p>

          <h1>
            {exploreCategory}
          </h1>

          <p>
            Discover what's happening in this category.
          </p>

        </header>

        <section className="explore-section category-results-section">

          <div className="explore-cards">

            {/* HACKATHONS */}

            {exploreCategory === "Hackathons" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    HACKATHON
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Microsoft Imagine Cup
                </h3>

                <p>
                  Build an innovative technology solution and compete globally.
                </p>

                <div className="card-meta">
                  💻 Hackathon
                </div>

                <div className="card-meta">
                  📅 Registration open
                </div>

              </div>
            )}

            {/* EVENTS */}

            {exploreCategory === "Events" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    EVENT
                  </span>

                  <span className="card-time">
                    Tomorrow
                  </span>
                </div>

                <h3>
                  Cybersecurity Workshop
                </h3>

                <p>
                  Learn practical cybersecurity skills with hands-on activities.
                </p>

                <div className="card-meta">
                  📅 15 Sep · 2:00 PM
                </div>

                <div className="card-meta">
                  📍 IGDTUW
                </div>

              </div>
            )}

            {/* CLUBS */}

            {exploreCategory === "Clubs" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    CLUB
                  </span>

                  <span className="card-time">
                    Trending
                  </span>
                </div>

                <h3>
                  ACM Orientation
                </h3>

                <p>
                  Meet the team and discover what's happening at ACM IGDTUW.
                </p>

                <div className="card-meta">
                  📅 14 Sep · 4:00 PM
                </div>

                <div className="card-meta">
                  📍 IGDTUW
                </div>

              </div>
            )}

            {/* ACADEMICS */}

            {exploreCategory === "Academics" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    ACADEMICS
                  </span>

                  <span className="card-time">
                    Today
                  </span>
                </div>

                <h3>
                  Academic Form Submission
                </h3>

                <p>
                  Submit your academic form before the deadline.
                </p>

                <div className="card-meta">
                  📚 Academic update
                </div>

                <div className="card-meta">
                  ⏰ Today · 11:59 PM
                </div>

              </div>
            )}

            {/* INTERNSHIPS */}

            {exploreCategory === "Internships" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    INTERNSHIP
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Summer Internship Opportunity
                </h3>

                <p>
                  Explore a new internship opportunity for students.
                </p>

                <div className="card-meta">
                  💼 Internship
                </div>

                <div className="card-meta">
                  📅 Applications open
                </div>

              </div>
            )}

            {/* COMPETITIONS */}

            {exploreCategory === "Competitions" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    COMPETITION
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Campus Design Challenge
                </h3>

                <p>
                  Showcase your creativity in this campus-wide competition.
                </p>

                <div className="card-meta">
                  🏆 Competition
                </div>

                <div className="card-meta">
                  📅 Registration open
                </div>

              </div>
            )}

          </div>

        </section>
      </>

    ) : (

      /* ================= MAIN EXPLORE SCREEN ================= */

      <>

        <header className="explore-header">

          <div>
            <p className="eyebrow">
              DISCOVER
            </p>

            <h1>
              Explore campus.
            </h1>

            <p>
              Find what's happening around you.
            </p>
          </div>

        </header>


        {/* SEARCH */}

        <div className="explore-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search campus updates..."
          />

        </div>


        {/* CATEGORIES */}

        <section className="explore-section">

          <div className="section-heading">
            <h2>
              Browse by category
            </h2>
          </div>

          <div className="category-grid">

            <button
              className="category-card"
              onClick={() => setExploreCategory("Hackathons")}
            >
              <span className="category-icon">
                🎯
              </span>

              <span>
                Hackathons
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Events")}
            >
              <span className="category-icon">
                🎉
              </span>

              <span>
                Events
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Clubs")}
            >
              <span className="category-icon">
                🏫
              </span>

              <span>
                Clubs
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Academics")}
            >
              <span className="category-icon">
                📚
              </span>

              <span>
                Academics
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Internships")}
            >
              <span className="category-icon">
                💼
              </span>

              <span>
                Internships
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Competitions")}
            >
              <span className="category-icon">
                🏆
              </span>

              <span>
                Competitions
              </span>
            </button>

          </div>

        </section>


        {/* FOR YOU */}

        <section className="explore-section">

          <div className="section-heading">

            <h2>
              ⭐ For You
            </h2>

          </div>

          <div className="explore-cards">

            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  EVENT
                </span>

                <span className="card-time">
                  Tomorrow
                </span>

              </div>

              <h3>
                Cybersecurity Workshop
              </h3>

              <p>
                Learn practical cybersecurity skills with hands-on activities.
              </p>

              <div className="card-meta">
                📅 15 Sep · 2:00 PM
              </div>

              <div className="card-meta">
                📍 IGDTUW
              </div>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  HACKATHON
                </span>

                <span className="card-time">
                  New
                </span>

              </div>

              <h3>
                Microsoft Imagine Cup
              </h3>

              <p>
                Build an innovative technology solution and compete globally.
              </p>

              <div className="card-meta">
                💻 Hackathon
              </div>

              <div className="card-meta">
                📅 Registration open
              </div>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  CLUB
                </span>

                <span className="card-time">
                  Trending
                </span>

              </div>

              <h3>
                ACM Orientation
              </h3>

              <p>
                Meet the team and discover what's happening at ACM IGDTUW.
              </p>

              <div className="card-meta">
                📅 14 Sep · 4:00 PM
              </div>

              <div className="card-meta">
                📍 IGDTUW
              </div>

            </div>

          </div>

        </section>


        {/* TRENDING */}

        <section className="explore-section">

          <div className="section-heading">

            <h2>
              🔥 Trending on Campus
            </h2>

          </div>

          <div className="explore-cards">

            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  CLUB
                </span>

              </div>

              <h3>
                Design Society
              </h3>

              <p>
                New recruitment and upcoming design activities.
              </p>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  EVENT
                </span>

              </div>

              <h3>
                Freshers' Sports Meet
              </h3>

              <p>
                Register for the upcoming sports meet.
              </p>

              <div className="card-meta">
                📅 18 Sep · 10:00 AM
              </div>

            </div>

          </div>

        </section>

      </>

    )}


    {/* ================= BOTTOM NAVIGATION ================= */}

    <nav className="bottom-nav">

      <button
        className={`nav-item ${
          page === "student-home"
            ? "active"
            : ""
        }`}
        onClick={() => setPage("student-home")}
      >
        <span>⌂</span>
        <small>Home</small>
      </button>


      <button
        className={`nav-item ${
          page === "explore"
            ? "active"
            : ""
        }`}
        onClick={() => setPage("explore")}
      >
        <span>⌕</span>
        <small>Explore</small>
      </button>


      <button
        className="nav-item ai-nav"
        onClick={() => setPage("ai")}
      >
        <span>✦</span>
        <small>AI</small>
      </button>


      <button
        className="nav-item"
        onClick={() => setPage("calendar")}
      >
        <span>▣</span>
        <small>Calendar</small>
      </button>


      <button
        className="nav-item"
        onClick={() => setPage("profile")}
      >
        <span>♙</span>
        <small>Profile</small>
      </button>

     </nav>
  </div>
)}

{/* ================= CALENDAR ================= */}

{!showIntro && page === "calendar" && (
  <div className="app-page calendar-page">

    <header className="calendar-header">

      <div>
        <p className="eyebrow">
          YOUR SCHEDULE
        </p>

        <h1>
          Calendar
        </h1>

        <p>
          Keep track of what's coming up.
        </p>
      </div>

    </header>


    {/* MONTH HEADER */}

    <section className="calendar-section">

      <div className="calendar-month-header">

        <button className="month-arrow">
          ←
        </button>

        <h2>
          September 2026
        </h2>

        <button className="month-arrow">
          →
        </button>

      </div>


      {/* WEEK DAYS */}

      <div className="calendar-weekdays">

        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
        <span>SUN</span>

      </div>


      {/* DATES */}

      <div className="calendar-grid">

        <span className="calendar-empty"></span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>

        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>10</span>
        <span>11</span>
        <span>12</span>
        <span>13</span>

        <button
          className="calendar-date has-event"
          onClick={() => setSelectedDate(14)}
        >
          14
        </button>

        <button
          className={`calendar-date has-event ${
            selectedDate === 15 ? "selected" : ""
          }`}
          onClick={() => setSelectedDate(15)}
        >
          15
        </button>

        <span>16</span>
        <span>17</span>

        <button
          className="calendar-date has-event"
          onClick={() => setSelectedDate(18)}
        >
          18
        </button>

        <span>19</span>
        <span>20</span>

        <span>21</span>
        <span>22</span>
        <span>23</span>
        <span>24</span>
        <span>25</span>
        <span>26</span>
        <span>27</span>

        <span>28</span>
        <span>29</span>
        <span>30</span>

      </div>

    </section>


    {/* UPCOMING EVENTS */}

    <section className="calendar-events-section">

      <div className="section-heading">

        <div className="section-title">
          <span className="calendar-dot">
            📅
          </span>

          <h2>
            Upcoming
          </h2>
        </div>

      </div>


      <div className="calendar-event-list">

        <div className="calendar-event-card">

          <div className="calendar-event-date">
            <strong>14</strong>
            <span>SEP</span>
          </div>

          <div className="calendar-event-info">

            <span className="calendar-event-tag">
              CLUB
            </span>

            <h3>
              ACM Orientation
            </h3>

            <p>
              Today · 4:00 PM · IGDTUW
            </p>

          </div>

          <span className="calendar-event-arrow">
            →
          </span>

        </div>


        <div className="calendar-event-card">

          <div className="calendar-event-date">
            <strong>15</strong>
            <span>SEP</span>
          </div>

          <div className="calendar-event-info">

            <span className="calendar-event-tag">
              WORKSHOP
            </span>

            <h3>
              Cybersecurity Workshop
            </h3>

            <p>
              Tomorrow · 2:00 PM · IGDTUW
            </p>

          </div>

          <span className="calendar-event-arrow">
            →
          </span>

        </div>


        <div className="calendar-event-card">

          <div className="calendar-event-date">
            <strong>18</strong>
            <span>SEP</span>
          </div>

          <div className="calendar-event-info">

            <span className="calendar-event-tag">
              EVENT
            </span>

            <h3>
              Freshers' Sports Meet
            </h3>

            <p>
              18 Sep · 10:00 AM · IGDTUW
            </p>

          </div>

          <span className="calendar-event-arrow">
            →
          </span>

        </div>

      </div>

    </section>


    {/* BOTTOM NAVIGATION */}

    <nav className="bottom-nav">

      <button
        className={`nav-item ${
          page === "student-home" ? "active" : ""
        }`}
        onClick={() => setPage("student-home")}
      >
        <span>⌂</span>
        <small>Home</small>
      </button>


      <button
        className={`nav-item ${
          page === "explore" ? "active" : ""
        }`}
        onClick={() => setPage("explore")}
      >
        <span>⌕</span>
        <small>Explore</small>
      </button>


      <button
        className="nav-item ai-nav"
        onClick={() => setPage("ai")}
      >
        <span>✦</span>
        <small>AI</small>
      </button>


      <button
        className={`nav-item ${
          page === "calendar" ? "active" : ""
        }`}
        onClick={() => setPage("calendar")}
      >
        <span>▣</span>
        <small>Calendar</small>
      </button>


      <button
        className="nav-item"
        onClick={() => setPage("profile")}
      >
        <span>♙</span>
        <small>Profile</small>
      </button>

    </nav>

   </div>
)}

</div>
  );
}

export default App;