import React from 'react';

import { fbLayoutNav as FbLayoutNav } from './fbLayoutNav';

export interface SectionSpec {
  id: string;
  name: string;
  requiredFields?: string[];
  getIncompleteCount?: (formState: any) => number;
}

export const getSectionStatus = (section: SectionSpec, formState: any) => {
  let incomplete = 0;
  const state = formState || {};
  if (section.requiredFields) {
    incomplete += section.requiredFields.filter(
      (field) => !state[field] || state[field] === "",
    ).length;
  }
  if (section.getIncompleteCount) {
    incomplete += section.getIncompleteCount(state);
  }
  return {
    incomplete,
    isComplete: incomplete === 0,
  };
};

export const areAllSectionsComplete = (sections: SectionSpec[], formState: any): boolean => {
  return sections.every((section) => getSectionStatus(section, formState).isComplete);
};

interface fbLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  bottomControls: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  style?: React.CSSProperties;

  // Configuration for automated nav panel & completeness checking
  sections?: SectionSpec[];
  formState?: any;
  activeSection?: string;
  setActiveSection?: (sectionId: string) => void;
  isReadOnlyView?: boolean;
}

export const fbLayout: React.FC<fbLayoutProps> = ({
  header,
  children,
  bottomControls,
  onSubmit = (e) => e.preventDefault(),
  style,
  sections,
  formState,
  activeSection,
  setActiveSection,
  isReadOnlyView = false,
}) => {
  const programmaticScrollRef = React.useRef<{ sectionId: string; timeout: number | null } | null>(null);
  // Prevent Unwanted <Enter> Key Submissions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") {
        return; // Allow newlines in textareas
      }
      const isSubmitButton = target.tagName === "BUTTON" && (target as HTMLButtonElement).type === "submit";
      if (!isSubmitButton) {
        e.preventDefault();
      }
    }
  };

  // Nesting level highlighting logic with alternating colors
  React.useEffect(() => {
    if (isReadOnlyView) return;

    const lighterYellow = "#ffffcc";
    const yellow = "#fee715";

    const getNestingLevel = (element: HTMLElement): number => {
      let level = 0;
      let current = element.parentElement;
      while (current) {
        if (
          current.classList.contains("fb-question-container") ||
          current.classList.contains("fb-radio-checkbox-group-container") ||
          current.classList.contains("fb-radio-checkbox-item") ||
          current.classList.contains("fb-subquestion") ||
          current.tagName === "TD"
        ) {
          level++;
        }
        current = current.parentElement;
      }
      return level;
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const level = getNestingLevel(target);
      const color = level % 2 === 0 ? lighterYellow : yellow;
      target.style.backgroundColor = color;
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      target.style.backgroundColor = "";
    };

    const handleFocusIn = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const level = getNestingLevel(target);
      const color = level % 2 === 0 ? lighterYellow : yellow;
      target.style.backgroundColor = color;
    };

    const handleFocusOut = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      target.style.backgroundColor = "";
    };

    const addListeners = () => {
      const elements = document.querySelectorAll(
        ".fb-question-container, .fb-radio-checkbox-group-container, .fb-radio-checkbox-item, .fb-subquestion",
      );
      elements.forEach((element) => {
        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);
        element.addEventListener("focusin", handleFocusIn);
        element.addEventListener("focusout", handleFocusOut);
      });
    };

    const removeListeners = () => {
      const elements = document.querySelectorAll(
        ".fb-question-container, .fb-radio-checkbox-group-container, .fb-radio-checkbox-item, .fb-subquestion",
      );
      elements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
        element.removeEventListener("focusin", handleFocusIn);
        element.removeEventListener("focusout", handleFocusOut);
      });
    };

    addListeners();

    const formElement = document.querySelector(".fb-layout-edit-view-form");
    let observer: MutationObserver | null = null;
    if (formElement) {
      observer = new MutationObserver(() => {
        removeListeners();
        addListeners();
      });
      observer.observe(formElement, { childList: true, subtree: true });
    }

    return () => {
      removeListeners();
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isReadOnlyView, children, formState]);

  // Track active section on scroll
  React.useEffect(() => {
    if (isReadOnlyView || !sections || sections.length === 0 || !setActiveSection) return;

    const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
    const handleScroll = () => {
      if (programmaticScrollRef.current) return;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && scrollContainer) {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          if (
            rect.top <= containerRect.top + 100 &&
            rect.bottom > containerRect.top
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isReadOnlyView, sections, setActiveSection, formState]);

  const hasNavPanel = sections && sections.length > 0;
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    const scrollContainer = sectionElement?.closest(".overflow-y-auto") as HTMLElement | null;
    if (!sectionElement || !scrollContainer) return;
    const sectionRect = sectionElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const nextTop = scrollContainer.scrollTop + sectionRect.top - containerRect.top;
    if (programmaticScrollRef.current?.timeout) {
      window.clearTimeout(programmaticScrollRef.current.timeout);
    }
    programmaticScrollRef.current = {
      sectionId,
      timeout: window.setTimeout(() => {
        setActiveSection?.(sectionId);
        programmaticScrollRef.current = null;
      }, 700),
    };
    scrollContainer.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    setActiveSection?.(sectionId);
  };

  return (
    <div
      className="bg-white flex flex-col fb-layout-container"
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        fontWeight: 300,
        lineHeight: 1.1,
        ...style
      }}
    >
      <form
        className="flex flex-col h-full fb-layout-edit-view-form"
        onSubmit={onSubmit}
        onKeyDown={handleKeyDown}
        noValidate
        style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}
      >
        {/* Fixed top Header Area (including title & Addressograph) */}
        <div style={{ flexShrink: 0 }}>
          {header}
        </div>

        {/* Central split area (Side Nav + Scrollable workspace) */}
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Automatically Rendered Left Navigation Panel with Counters! */}
          {hasNavPanel && (
            <nav
              className="w-64 overflow-y-auto hidden md:block"
              aria-label="Form sections"
              style={{
                backgroundColor: "white",
                padding: "0.4rem",
                borderRight: "none",
                flexShrink: 0,
                height: '100%',
              }}
            >
              <FbLayoutNav
                items={sections.map((section) => {
                  const status = getSectionStatus(section, formState);
                  return {
                    id: section.id,
                    label: section.name,
                    isActive: activeSection === section.id,
                    isComplete: status.isComplete,
                    incomplete: status.incomplete,
                    onClick: () => scrollToSection(section.id),
                  };
                })}
              />
            </nav>
          )}

          {/* Core scrollable workspace sheet */}
          <div
            className="flex-1 overflow-y-auto bg-white"
            style={{
              padding: '0.8rem 0 4rem 0', // generous bottom padding so elements don't hide behind fixed footer
              height: '100%',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: '100%' }}>
              {children}
            </div>
          </div>
        </div>

        {/* Sticky styled horizontal actions bar */}
        <div style={{ flexShrink: 0 }}>
          {bottomControls}
        </div>
      </form>
    </div>
  );
};
