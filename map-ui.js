/**
 * =========================================================
 * PROJECT SHARDS
 * Map UI
 *
 * גרסה: 0.1.0
 *
 * אחראי על:
 * - בחירת גיבור לקרבות המפה
 * - תצוגת הנקודה הנוכחית ופעולותיה
 * - תצוגת פאנל "נופל" עם אפשרויות תחייה
 * - תצוגת שביל התקדמות (12 הנקודות, מודגשת הנוכחית)
 *
 * אין כאן Game Logic — הכל דרך map-system.js.
 * =========================================================
 */


import {

    סוגי_נקודות,

    מפה_ראשית,

    אייקוןלסוגנקודה

} from "./map-data.js";


import {

    קבלאינדקסנוכחי,

    קבלנקודהנוכחית,

    האםנופל,

    זמןנותרלתחייהmsec,

    שלםתחייהבכסף,

    שלםתחייהביהלומים,

    צאלקרבמפה,

    צאלמסעמפה,

    סייםבחנותמפה,

    עלות_תחייה_כסף,

    עלות_תחייה_יהלומים

} from "./map-system.js";


import {

    קבלגיבורנבחר,

    קבלגיבורי_הקבוצה,

    קבלגיבוריהשחקן,

    בחרגיבור

} from "../heroes/hero-system.js";


import {

    קבלסמלגיבור

} from "../heroes/hero-data.js";


import {

    צייררקרב,

    הפעלמעברמסך

} from "../battle/battle-ui.js";


import {

    הירשם

} from "../core/events.js";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    heroSelector:
        document.getElementById(
            "map-hero-selector"
        ),

    nodeIcon:
        document.getElementById(
            "map-node-icon"
        ),

    nodeTitle:
        document.getElementById(
            "map-node-title"
        ),

    nodeDescription:
        document.getElementById(
            "map-node-description"
        ),

    nodeActions:
        document.getElementById(
            "map-node-actions"
        ),

    fallenPanel:
        document.getElementById(
            "map-fallen-panel"
        ),

    nodeResult:
        document.getElementById(
            "map-node-result"
        ),

    trail:
        document.getElementById(
            "map-trail"
        )

};


/* =========================================================
   מצב תצוגה מקומי
========================================================= */

let גיבורנבחרלמפה = null;

let טיימר_רענון = null;


/* =========================================================
   הגנה בסיסית לפני הכנסת טקסט ל-innerHTML
========================================================= */

function ברח_טקסט(
    טקסט
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        טקסט ?? "";


    return div.innerHTML;

}


/* =========================================================
   כותרת קריאה לסוג נקודה
========================================================= */

function כותרתלסוגנקודה(
    נקודה
) {

    switch (נקודה.סוג) {

        case סוגי_נקודות.BATTLE:
            return "קרב";

        case סוגי_נקודות.BOSS:
            return "בוס!";

        case סוגי_נקודות.JOURNEY:
            return "מסע";

        case סוגי_נקודות.SHOP:
            return "חנות מיוחדת";

        default:
            return "נקודה";

    }

}


function תיאורלסוגנקודה(
    נקודה
) {

    switch (נקודה.סוג) {

        case סוגי_נקודות.BATTLE:
            return `קרב נגד ${נקודה.מפתחאויב}. ניצחון מתקדם אותך בשביל.`;

        case סוגי_נקודות.BOSS:
            return `בוס חזק — ${נקודה.מפתחאויב}. היזהר לפני שאתה נכנס.`;

        case סוגי_נקודות.JOURNEY:
            return "מסע רגיל שמעניק משאבים, ניסיון, ולפעמים גיבור חדש.";

        case סוגי_נקודות.SHOP:
            return "עצור, קנה מה שצריך, והמשך כשתהיה מוכן.";

        default:
            return "";

    }

}


/* =========================================================
   פורמט זמן נותר
========================================================= */

function פורמטזמן(
    ms
) {

    const שניותכולל =
        Math.ceil(ms / 1000);

    const דקות =
        Math.floor(שניותכולל / 60);

    const שניות =
        שניותכולל % 60;


    return (

        String(דקות).padStart(2, "0") +

        ":" +

        String(שניות).padStart(2, "0")

    );

}


/* =========================================================
   בורר גיבורים
========================================================= */

function הצגבוררגיבורים() {

    if (
        !DOM.heroSelector
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    const עדייןתקף =

        גיבורנבחרלמפה &&

        גיבורים.some(

            ג => ג.id === גיבורנבחרלמפה

        );


    if (
        !עדייןתקף
    ) {

        const קבוצה =
            קבלגיבורי_הקבוצה();


        const נבחר =
            קבלגיבורנבחר();


        גיבורנבחרלמפה =

            (נבחר && נבחר.id)
                || (קבוצה[0] && קבוצה[0].id)
                || (גיבורים[0] && גיבורים[0].id)
                || null;

    }


    DOM.heroSelector.innerHTML =
        "";


    גיבורים.forEach(

        גיבור => {

            const כפתור =
                document.createElement(
                    "button"
                );

            כפתור.type =
                "button";

            כפתור.className =

                "hero-deck-selector-item" +

                (
                    גיבור.id === גיבורנבחרלמפה
                        ? " selected"
                        : ""
                );


            כפתור.innerHTML = `

                <span class="hero-deck-selector-icon">
                    ${ברח_טקסט(קבלסמלגיבור(גיבור))}
                </span>

                <span class="hero-deck-selector-name">
                    ${ברח_טקסט(גיבור.שם)}
                    (${גיבור.stats.hp}/${גיבור.stats.maxHp})
                </span>

            `;


            כפתור.addEventListener(

                "click",

                () => {

                    גיבורנבחרלמפה =
                        גיבור.id;


                    בחרגיבור(
                        גיבור.id
                    );


                    צייררמסךמפה();

                }

            );


            DOM.heroSelector.appendChild(
                כפתור
            );

        }

    );

}


/* =========================================================
   פאנל נפילה (תחייה)
========================================================= */

function הצגפאנלנפילה() {

    if (
        !DOM.fallenPanel
    ) {

        return;

    }


    const נופל =
        האםנופל();


    DOM.fallenPanel.classList.toggle(

        "hidden",

        !נופל

    );


    if (
        !נופל
    ) {

        return;

    }


    const msנותר =
        זמןנותרלתחייהmsec();


    DOM.fallenPanel.innerHTML = `

        <p class="map-fallen-text">
            💔 הגיבור נפל בקרב. אפשר להמתין
            <strong>${ברח_טקסט(פורמטזמן(msנותר))}</strong>
            או לשלם כדי לחזור לפעולה מיד.
        </p>

        <div class="map-fallen-actions">

            <button
                type="button"
                id="map-revive-gold"
                class="secondary-button"
            >
                החייאה — ${עלות_תחייה_כסף} 🪙
            </button>

            <button
                type="button"
                id="map-revive-diamonds"
                class="secondary-button"
            >
                החייאה — ${עלות_תחייה_יהלומים} 💎
            </button>

        </div>

    `;


    const כפתורכסף =
        document.getElementById(
            "map-revive-gold"
        );

    const כפתוריהלומים =
        document.getElementById(
            "map-revive-diamonds"
        );


    if (
        כפתורכסף
    ) {

        כפתורכסף.addEventListener(

            "click",

            () => {

                שלםתחייהבכסף();

                צייררמסךמפה();

            }

        );

    }


    if (
        כפתוריהלומים
    ) {

        כפתוריהלומים.addEventListener(

            "click",

            () => {

                שלםתחייהביהלומים();

                צייררמסךמפה();

            }

        );

    }

}


/* =========================================================
   כרטיס הנקודה הנוכחית
========================================================= */

function הצגנקודהנוכחית() {

    const נקודה =
        קבלנקודהנוכחית();


    if (
        !נקודה
    ) {

        return;

    }


    if (
        DOM.nodeIcon
    ) {

        DOM.nodeIcon.textContent =

            אייקוןלסוגנקודה(
                נקודה.סוג
            );

    }


    if (
        DOM.nodeTitle
    ) {

        DOM.nodeTitle.textContent =

            כותרתלסוגנקודה(
                נקודה
            );

    }


    if (
        DOM.nodeDescription
    ) {

        DOM.nodeDescription.textContent =

            תיאורלסוגנקודה(
                נקודה
            );

    }


    if (
        !DOM.nodeActions
    ) {

        return;

    }


    DOM.nodeActions.innerHTML =
        "";


    const נופל =
        האםנופל();


    if (
        נופל
    ) {

        return;

    }


    if (

        נקודה.סוג === סוגי_נקודות.BATTLE ||
        נקודה.סוג === סוגי_נקודות.BOSS

    ) {

        const כפתור =
            document.createElement(
                "button"
            );

        כפתור.type =
            "button";

        כפתור.className =
            "primary-button";

        כפתור.textContent =

            נקודה.סוג === סוגי_נקודות.BOSS
                ? "צא לקרב הבוס"
                : "צא לקרב";


        כפתור.addEventListener(

            "click",

            () => {

                if (
                    !גיבורנבחרלמפה
                ) {

                    return;

                }


                const הצליח =
                    צאלקרבמפה(
                        גיבורנבחרלמפה
                    );


                if (
                    הצליח
                ) {

                    צייררקרב();

                    הפעלמעברמסך();

                }

            }

        );


        DOM.nodeActions.appendChild(
            כפתור
        );

        return;

    }


    if (
        נקודה.סוג === סוגי_נקודות.JOURNEY
    ) {

        const כפתור =
            document.createElement(
                "button"
            );

        כפתור.type =
            "button";

        כפתור.className =
            "primary-button";

        כפתור.textContent =
            "צא למסע";


        כפתור.addEventListener(

            "click",

            () => {

                const תוצאה =
                    צאלמסעמפה();


                הצגתוצאתנקודה(
                    תוצאה
                );


                צייררמסךמפה();

            }

        );


        DOM.nodeActions.appendChild(
            כפתור
        );

        return;

    }


    if (
        נקודה.סוג === סוגי_נקודות.SHOP
    ) {

        const כפתור =
            document.createElement(
                "button"
            );

        כפתור.type =
            "button";

        כפתור.className =
            "primary-button";

        כפתור.textContent =
            "המשך בשביל";


        כפתור.addEventListener(

            "click",

            () => {

                סייםבחנותמפה();

                צייררמסךמפה();

            }

        );


        DOM.nodeActions.appendChild(
            כפתור
        );

    }

}


/* =========================================================
   הצגת תוצאת מסע-מפה
========================================================= */

function הצגתוצאתנקודה(
    תוצאה
) {

    if (
        !DOM.nodeResult ||
        !תוצאה
    ) {

        return;

    }


    DOM.nodeResult.classList.remove(
        "hidden"
    );


    DOM.nodeResult.innerHTML = `

        <h3 class="journey-result-title">
            ${ברח_טקסט(תוצאה.כותרת)}
        </h3>

        <p class="journey-result-text">
            ${ברח_טקסט(תוצאה.טקסט)}
        </p>

    `;

}


/* =========================================================
   שביל התקדמות
========================================================= */

function הצגשביל() {

    if (
        !DOM.trail
    ) {

        return;

    }


    const אינדקסנוכחי =
        קבלאינדקסנוכחי();


    DOM.trail.innerHTML =
        "";


    מפה_ראשית.forEach(

        (נקודה, אינדקס) => {

            const תא =
                document.createElement(
                    "div"
                );

            תא.className =

                "map-trail-node" +

                (
                    אינדקס === אינדקסנוכחי
                        ? " current"
                        : ""
                ) +

                (
                    אינדקס < אינדקסנוכחי
                        ? " passed"
                        : ""
                );


            תא.innerHTML = `

                <span class="map-trail-icon">
                    ${אייקוןלסוגנקודה(נקודה.סוג)}
                </span>

            `;


            DOM.trail.appendChild(
                תא
            );

        }

    );

}


/* =========================================================
   ציור מלא של מסך המפה
========================================================= */

function צייררמסךמפה() {

    if (
        DOM.nodeResult
    ) {

        DOM.nodeResult.classList.add(
            "hidden"
        );

    }


    הצגבוררגיבורים();

    הצגפאנלנפילה();

    הצגנקודהנוכחית();

    הצגשביל();

}


/* =========================================================
   רענון תקופתי (לספירה לאחור של תחייה)
========================================================= */

function התחלרענוןתקופתי() {

    if (
        טיימר_רענון
    ) {

        return;

    }


    טיימר_רענון =

        setInterval(

            () => {

                if (
                    האםנופל()
                ) {

                    הצגפאנלנפילה();

                } else {

                    צייררמסךמפה();

                }

            },

            1000

        );

}


/* =========================================================
   אתחול
========================================================= */

function אתחלממשקמפה() {

    צייררמסךמפה();

    התחלרענוןתקופתי();


    [

        "מפה_התקדמה",

        "מפה_נפילה",

        "מפה_תחייה",

        "גיבורים_נטענו",

        "חפץ_צויד",

        "חפץ_הוסר"

    ].forEach(

        שםאירוע => {

            הירשם(

                שםאירוע,

                () => {

                    צייררמסךמפה();

                }

            );

        }

    );

}


/* =========================================================
   Export
========================================================= */

export {

    אתחלממשקמפה,

    צייררמסךמפה

};
