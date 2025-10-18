import React from 'react';
import './Features.css';

// A helper component for the gradient text
const GradientText = ({ children, colors }) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block'
  };
  return <span style={gradientStyle}>{children}</span>;
};

const Features = ({ sections }) => {
  return (
    <section className="features-main-section">
      {sections.map(section => (
        <div key={section.id} className="features-section-category">
          <div className="category-header">
            <h2 className="category-title">
              <GradientText colors={section.gradientColors}>{section.title}</GradientText>
            </h2>
          </div>

          <div className="features-grid">
            {section.items.map(item => (
              <div 
                key={item.id} 
                className="feature-card-new" // Removed highlight class
              >
                {/* We add a class based on the section ID for styling */}
                <div className={`feature-icon-wrapper ${section.id}`}>
                  {item.icon}
                </div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="feature-card-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Features;