import * as React from 'react';

export const useEditFormLabelEqualization = (
  disabled: boolean,
  dependencies: React.DependencyList
) => {
  React.useLayoutEffect(() => {
    if (disabled) return;

    const adjustLabelHeights = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        const allLabels = document.querySelectorAll(
          ".fb-layout-edit-view-form .fb-question-container > label:not(.fb-radio-checkbox-item)"
        );
        allLabels.forEach((lbl) => {
          const hElement = lbl as HTMLElement;
          hElement.style.height = "auto";
          hElement.style.paddingTop = "0px";
          hElement.style.display = "block";
        });
        return;
      }

      const rows = document.querySelectorAll(
        ".fb-layout-edit-view-form .questions-row, .fb-layout-edit-view-form .grid, .fb-layout-edit-view-form .fb-designer-question-row"
      );
      rows.forEach((row) => {
        if (!row.querySelector(".fb-question-container")) return;

        const labels = Array.from(
          row.querySelectorAll(
            ".fb-question-container > label:not(.fb-radio-checkbox-item)"
          )
        ) as HTMLElement[];

        const rowLabels = labels.filter((lbl) => {
          let parent = lbl.parentElement;
          while (parent && parent !== row) {
            if (
              parent.classList.contains("fb-subquestion") ||
              parent.classList.contains("fb-subquestion-wrapper")
            ) {
              return false;
            }
            parent = parent.parentElement;
          }
          return true;
        });

        if (rowLabels.length <= 1) return;

        rowLabels.forEach((lbl) => {
          lbl.style.height = "auto";
          lbl.style.paddingTop = "0px";
          lbl.style.display = "block";
        });

        const heights = rowLabels.map((lbl) => lbl.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);

        if (maxHeight > 0) {
          rowLabels.forEach((lbl, idx) => {
            const naturalHeight = heights[idx];
            const diff = maxHeight - naturalHeight;
            lbl.style.boxSizing = "border-box";
            lbl.style.height = `${maxHeight}px`;
            lbl.style.paddingTop = `${diff}px`;
            lbl.style.display = "block";
          });
        }
      });
    };

    const timer = setTimeout(adjustLabelHeights, 50);
    window.addEventListener("resize", adjustLabelHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustLabelHeights);
    };
  }, [disabled, ...dependencies]);
};

export const useEditFormAutoExpandTextareas = (
  disabled: boolean,
  dependencies: React.DependencyList
) => {
  React.useLayoutEffect(() => {
    if (disabled) return;

    const textareas = document.querySelectorAll(".fb-layout-edit-view-form textarea");
    const listeners: Array<{
      element: HTMLTextAreaElement;
      handler: () => void;
    }> = [];

    textareas.forEach((ta) => {
      const textarea = ta as HTMLTextAreaElement;

      const adjustHeight = () => {
        textarea.style.height = "auto";
        const defaultHeight = 44;
        textarea.style.height = `${Math.max(defaultHeight, textarea.scrollHeight)}px`;
      };

      adjustHeight();

      textarea.addEventListener("input", adjustHeight);
      listeners.push({ element: textarea, handler: adjustHeight });
    });

    return () => {
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener("input", handler);
      });
    };
  }, [disabled, ...dependencies]);
};

export const resizeTextareaToContent = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};
