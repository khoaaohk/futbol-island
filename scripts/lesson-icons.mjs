// Normalize legacy icon metadata without changing lesson or narration content.
const names={"\u26bd":"ball","\ud83d\udee1\ufe0f":"shield","\ud83d\udccb":"clipboard","\ud83c\udfc3":"run","\ud83e\udde4":"gloves","\u2194\ufe0f":"swap","\ud83e\udd1d":"handshake"};
export const lessonIcon=icon=>names[icon]??icon;
