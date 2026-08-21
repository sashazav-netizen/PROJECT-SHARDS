/**
 * =========================================================
 * PROJECT SHARDS
 * Card UI
 *
 * גרסה: 0.1.0
 *
 * אחראי על:
 * - הצגת סיכום החפיסה (כמה מכל סוג קלף)
 * - הצגת אוסף הקלפים המלא
 *
 * אין כאן Game Logic.
 * אין כאן חישובי קרב.
 * =========================================================
 */


import {

    נתוני_קלפים

} from "./card-data.js";


import {

    קבלחפיסתגיבור

} from "./card-system.js";


import {

    קבלגיבוריהשחקן

} from "../heroes/hero-system.js";


import {

    קבלסמלגיבור

} from "../heroes/hero-data.js";


import {

    קבלמצב

} from "../core/state.js";


import {

    הירשם

} from "../core/events.js";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    heroSelector:
        document.getElementById(
            "hero-deck-selector"
        ),

    summaryTitle:
        document.getElementById(
            "deck-summary-title"
        ),

    counter:
        document.getElementById(
            "deck-counter"
        ),

    summary:
        document.getElementById(
            "deck-summary"
        ),

    collection:
        document.getElementById(
            "cards-collection"
        )

};


/* =========================================================
   מצב תצוגה מקומי — איזה גיבור נבחר להצגה
========================================================= */

let גיבורנבחרלתצוגה = null;


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
   אייקון לפי סוג קלף
========================================================= */

function אייקוןלסוגקלף(
    סוג
) {

    switch (סוג) {

        case "התקפה":
            return "⚔️";

        case "הגנה":
            return "🛡️";

        case "יכולת":
            return "✨";

        case "אולטימט":
            return "💥";

        case "קומבו":
            return "🔗";

        default:
            return "🃏";

    }

}


/* =========================================================
   בורר גיבורים לצפייה בחפיסה
========================================================= */

function הצגבוררגיבורים() {

    if (
        !DOM.heroSelector
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    /* ---------------------------------------------
       אם אין עדיין גיבור נבחר, או שהגיבור שנבחר
       כבר לא קיים — בוחרים את הראשון כברירת מחדל.
    --------------------------------------------- */

    const עדייןתקף =

        גיבורנבחרלתצוגה &&

        גיבורים.some(

            ג => ג.id === גיבורנבחרלתצוגה

        );


    if (
        !עדייןתקף
    ) {

        גיבורנבחרלתצוגה =

            גיבורים.length > 0
                ? גיבורים[0].id
                : null;

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
                    גיבור.id === גיבורנבחרלתצוגה
                        ? " selected"
                        : ""
                );


            כפתור.innerHTML = `

                <span class="hero-deck-selector-icon">
                    ${ברח_טקסט(קבלסמלגיבור(גיבור))}
                </span>

                <span class="hero-deck-selector-name">
                    ${ברח_טקסט(גיבור.שם)}
                </span>

            `;


            כפתור.addEventListener(

                "click",

                () => {

                    גיבורנבחרלתצוגה =
                        גיבור.id;


                    הצגבוררגיבורים();

                    הצגסיכוםחפיסה();

                }

            );


            DOM.heroSelector.appendChild(
                כפתור
            );

        }

    );

}


/* =========================================================
   הצגת סיכום חפיסה (של הגיבור הנבחר)
========================================================= */

function הצגסיכוםחפיסה() {

    if (
        !DOM.summary
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    const גיבור =
        גיבורים.find(

            ג => ג.id === גיבורנבחרלתצוגה

        );


    if (
        DOM.summaryTitle
    ) {

        DOM.summaryTitle.textContent =

            גיבור
                ? `החפיסה של ${גיבור.שם}`
                : "החפיסה שלי";

    }


    const חפיסה =

        גיבור
            ? קבלחפיסתגיבור(גיבור)
            : [];


    if (
        DOM.counter
    ) {

        DOM.counter.textContent =

            `${חפיסה.length}/30`;

    }


    /* ---------------------------------------------
       ספירה לפי מפתח קלף
    --------------------------------------------- */

    const ספירה = {};


    חפיסה.forEach(

        מפתח => {

            ספירה[מפתח] =

                (ספירה[מפתח] || 0) + 1;

        }

    );


    DOM.summary.innerHTML =
        "";


    Object.keys(
        ספירה
    ).forEach(

        מפתח => {

            const קלף =
                נתוני_קלפים[
                    מפתח
                ];


            if (
                !קלף
            ) {

                return;

            }


            const שורה =
                document.createElement(
                    "div"
                );

            שורה.className =

                "deck-summary-row" +

                (
                    Array.isArray(קלף.מחלקה)
                        ? " class-specific"
                        : ""
                );


            שורה.innerHTML = `

                <span class="deck-summary-icon">
                    ${אייקוןלסוגקלף(קלף.סוג)}
                </span>

                <span class="deck-summary-name">
                    ${ברח_טקסט(קלף.שם)}
                    ${Array.isArray(קלף.מחלקה) ? " ⭐" : ""}
                </span>

                <span class="deck-summary-count">
                    ×${ספירה[מפתח]}
                </span>

            `;


            DOM.summary.appendChild(
                שורה
            );

        }

    );

}


/* =========================================================
   הצגת אוסף קלפים
========================================================= */

function הצגאוסףקלפים() {

    if (
        !DOM.collection
    ) {

        return;

    }


    const מצב =
        קבלמצב();


    const מפתחותפתוחים =

        (מצב && Array.isArray(מצב.קלפים))
            ? מצב.קלפים
            : [];


    DOM.collection.innerHTML =
        "";


    מפתחותפתוחים.forEach(

        מפתח => {

            const קלף =
                נתוני_קלפים[
                    מפתח
                ];


            if (
                !קלף
            ) {

                return;

            }


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "card-tile";


            const אפקטים = [];


            if (
                קלף.נזק > 0
            ) {

                אפקטים.push(

                    `⚔️ ${קלף.נזק}`

                );

            }


            if (
                קלף.הגנה > 0
            ) {

                אפקטים.push(

                    `🛡️ ${קלף.הגנה}`

                );

            }


            if (
                קלף.ריפוי > 0
            ) {

                אפקטים.push(

                    `❤️ ${קלף.ריפוי}`

                );

            }


            card.innerHTML = `

                <div class="card-tile-top">

                    <span class="card-tile-icon">
                        ${אייקוןלסוגקלף(קלף.סוג)}
                    </span>

                    <span class="card-tile-cost">
                        ${קלף.עלות} ⚡
                    </span>

                </div>

                <h3 class="card-tile-name">
                    ${ברח_טקסט(קלף.שם)}
                </h3>

                <div class="card-tile-type">
                    ${ברח_טקסט(קלף.סוג)}
                    ${קלף.שריפה ? " · נשרף לאחר שימוש" : ""}
                </div>

                <p class="card-tile-description">
                    ${ברח_טקסט(קלף.תיאור)}
                </p>

                <div class="card-tile-effects">
                    ${אפקטים.join(" &nbsp; ")}
                </div>

            `;


            DOM.collection.appendChild(
                card
            );

        }

    );

}


/* =========================================================
   אתחול
========================================================= */

function אתחלממשקקלפים() {

    הצגבוררגיבורים();

    הצגסיכוםחפיסה();

    הצגאוסףקלפים();


    הירשם(

        "קלפים_נטענו",

        () => {

            הצגסיכוםחפיסה();

            הצגאוסףקלפים();

        }

    );


    הירשם(

        "גיבורים_נטענו",

        () => {

            הצגבוררגיבורים();

            הצגסיכוםחפיסה();

        }

    );

}


/* =========================================================
   Export
========================================================= */

export {

    אתחלממשקקלפים

};
