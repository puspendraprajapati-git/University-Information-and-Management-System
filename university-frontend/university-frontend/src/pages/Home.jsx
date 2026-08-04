import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Row, Col, Card, Button } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {}
      <Navbar expand="lg" fixed="top" className="home-navbar">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="home-brand">
            EduCore
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

      {}
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
              <Button as={Link} to="/register" size="lg" className="hero-cta rounded-pill px-5 py-3 fw-bold border-0">
                Join the Campus
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      {}
      <section className="home-features py-5 bg-light">
        <Container className="py-5">
          <Row className="g-4">

            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <Card.Body>
                  <div className="feature-icon mb-3">📚</div>
                  <Card.Title className="fw-bold mb-3">Academic Excellence</Card.Title>
                  <Card.Text className="text-muted">
                    Access your subjects, track your grades, and download syllabuses in real-time. Keep your academic journey on track effortlessly.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <Card.Body>
                  <div className="feature-icon mb-3">🗓️</div>
                  <Card.Title className="fw-bold mb-3">Smart Attendance</Card.Title>
                  <Card.Text className="text-muted">
                    Faculty can mark attendance digitally, while students can monitor their attendance records instantly to avoid falling behind.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <Card.Body>
                  <div className="feature-icon mb-3">🎉</div>
                  <Card.Title className="fw-bold mb-3">Campus Events</Card.Title>
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
