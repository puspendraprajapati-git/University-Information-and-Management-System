import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Row, Col, Card, Button } from 'react-bootstrap';
import { GraduationCap, BookOpen, ClipboardList, Bell, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navigation */}
      <Navbar expand="lg" fixed="top" className="home-navbar">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="home-brand d-flex align-items-center gap-2">
            <div
              className="rounded-3 p-1.5 d-flex align-items-center justify-content-center text-white"
              style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
            >
              <GraduationCap size={20} />
            </div>
            <span>EduCore</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link as={Link} to="/login" className="home-nav-btn btn-signin">
                Sign In
              </Nav.Link>
              <Button as={Link} to="/register" className="home-nav-btn btn-signup border-0">
                Sign Up Free
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <header className="home-hero" style={{ backgroundImage: "url('/campus-hero.png')" }}>
        <Container className="hero-content">
          <Row className="justify-content-center text-center">
            <Col lg={10} xl={8}>
              <h1 className="hero-title display-3 fw-bold mb-4">
                The Future of <span>Education</span> Starts Here
              </h1>
              <p className="hero-subtitle lead mb-5">
                A unified portal to manage your academics, track attendance, check results, and stay updated with the latest campus events. Designed for students, faculty, and administrators.
              </p>
              <Button as={Link} to="/register" size="lg" className="hero-cta rounded-pill px-5 py-3 fw-bold border-0 d-inline-flex align-items-center gap-2">
                <span>Join the Campus</span>
                <ArrowRight size={20} />
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Features Section */}
      <section className="home-features py-5 bg-white">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase" style={{ letterSpacing: "1.5px" }}>Everything You Need</h6>
            <h2 className="fw-bold text-dark">Built for Modern Campus Life</h2>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 border-0 p-3 shadow-sm">
                <Card.Body>
                  <div
                    className="feature-icon mb-3 d-inline-flex p-3 rounded-3"
                    style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}
                  >
                    <BookOpen size={28} />
                  </div>
                  <Card.Title className="fw-bold mb-2 fs-5">Academic Excellence</Card.Title>
                  <Card.Text className="text-muted">
                    Access your subjects, track your grades, and download syllabuses in real-time. Keep your academic journey on track effortlessly.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 border-0 p-3 shadow-sm">
                <Card.Body>
                  <div
                    className="feature-icon mb-3 d-inline-flex p-3 rounded-3"
                    style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
                  >
                    <ClipboardList size={28} />
                  </div>
                  <Card.Title className="fw-bold mb-2 fs-5">Smart Attendance</Card.Title>
                  <Card.Text className="text-muted">
                    Faculty can mark attendance digitally, while students can monitor their attendance records instantly to avoid falling behind.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 border-0 p-3 shadow-sm">
                <Card.Body>
                  <div
                    className="feature-icon mb-3 d-inline-flex p-3 rounded-3"
                    style={{ backgroundColor: "#fffbeb", color: "#d97706" }}
                  >
                    <Bell size={28} />
                  </div>
                  <Card.Title className="fw-bold mb-2 fs-5">Campus Events</Card.Title>
                  <Card.Text className="text-muted">
                    Never miss out on workshops, seminars, or cultural fests. Get live updates on everything happening around the campus.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
