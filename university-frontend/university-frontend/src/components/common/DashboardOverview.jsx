import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const DashboardOverview = ({ title, subtitle, cards = [] }) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">{title}</h3>
        <p className="text-muted">{subtitle}</p>
      </div>

      <div className="row g-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div className="col-12 col-md-6 col-lg-4" key={idx}>
              <div className="card h-100 p-4 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: card.bgColor || "#eef2ff", color: card.color || "#4f46e5" }}
                  >
                    {Icon && <Icon size={24} />}
                  </div>
                  <span className="badge bg-light text-secondary border px-2.5 py-1 rounded-pill small">
                    {card.badge || "Module"}
                  </span>
                </div>
                <h5 className="fw-bold text-dark mb-2">{card.title}</h5>
                <p className="text-muted small mb-4 flex-grow-1">{card.description}</p>
                <Link
                  to={card.to}
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5 w-100 justify-content-center py-2"
                >
                  <span>Open {card.title}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOverview;
