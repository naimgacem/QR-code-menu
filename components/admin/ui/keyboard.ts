/** True when a keystroke belongs to a text field, so single-key shortcuts
 * ("N", "/") don't fire while the owner is typing a dish name. */
export const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** Something modal is open (useModal locks body scroll while it is). */
export const isModalOpen = () => document.body.style.overflow === "hidden";
