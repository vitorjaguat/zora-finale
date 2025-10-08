"use client";

import { useEffect, useState } from "react";

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Include hero section but it won't correspond to any menu item
    const sections = ["hero", "the-plan", "address-checker", "donate"];
    const menuSections = ["the-plan", "address-checker", "donate"]; // Only these have menu items
    const observers: IntersectionObserver[] = [];
    let currentActiveSection = "";

    // Add a small delay to ensure all components are mounted
    const timeoutId = setTimeout(() => {
      // Create intersection observers for each section
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) {
          console.warn(`Element with id "${sectionId}" not found`);
          return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // Update when a section becomes visible or stops being visible
              if (entry.isIntersecting) {
                currentActiveSection = entry.target.id;
                // Only set state for sections that have menu items (exclude hero)
                if (menuSections.includes(entry.target.id)) {
                  setActiveSection(entry.target.id);
                } else if (entry.target.id === "hero") {
                  // If hero is active, clear the active section (no menu item should be underlined)
                  setActiveSection("");
                }
              }
            });
          },
          {
            // Use a threshold to reduce sensitivity and flickering
            threshold: 0.2,
            // More conservative margins to prevent rapid switching
            rootMargin: "-20% 0px -20% 0px",
          },
        );

        observer.observe(element);
        observers.push(observer);

        // Check if this section is already visible when the observer is created
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isAlreadyVisible =
          rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;

        if (isAlreadyVisible && !currentActiveSection) {
          currentActiveSection = sectionId;
          // Only set state for sections that have menu items
          if (menuSections.includes(sectionId)) {
            setActiveSection(sectionId);
          } else if (sectionId === "hero") {
            // If hero is initially visible, no menu item should be active
            setActiveSection("");
          }
        }
      });
    }, 100);

    // Cleanup observers on unmount
    return () => {
      clearTimeout(timeoutId);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []); // No dependencies needed since we're using local variable

  return activeSection;
}
