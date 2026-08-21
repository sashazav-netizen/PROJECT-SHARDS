/**
 * =========================================================
 * PROJECT SHARDS
 * Inventory UI
 *
 * גרסה: 0.1.0
 *
 * אחראי על:
 * - בחירת גיבור לציוד
 * - תצוגת משבצות הציוד שלו (וכפתור הסרה)
 * - תצוגת כל החפצים בתיק (וכפתורי ציוד/מכירה)
 *
 * אין כאן Game Logic — הכל דרך item-system.js.
 * =========================================================
 */


import {

    נתוני_חפצים,

    אייקוןלסוגחפץ

} from "./item-data.js";


import {

    קבלחפציהשחקן,

    ציידחפץ,

    הסרציודגיבור,

    מכורחפץ

} from "./item-system.js";


import {

    קבלגיבוריהשחקן

} from "../heroes/hero-system.js";


import {

    קבלסמלגיבור

} from "../heroes/hero-data.js";


import {

    בקשאישור

} from "../core/confirm-modal.js";


import {

    הירשם

} from "../core/events.js";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    heroSelector:
        document.getElementById(
            "inventory-hero-selector"
        ),

    equipmentTitle:
        document.getElementById(
            "equipment-title"
        ),

    equipmentSlots:
        document.getElementById(
            "equipment-slots"
        ),

    equipmentTotals:
        document.getElementById(
            "equipment-totals"
        ),

    filter:
        document.getElementById(
            "inventory-filter"
        ),

    items:
        document.getElementById(
            "inventory-items"
        )

};


/* =========================================================
   מצב תצוגה מקומי
========================================================= */

let גיבורנבחרלציוד = null;

let מסנןנוכחי = "הכל";


/* =========================================================
   הגדרת משבצות
========================================================= */

const משבצות = [

    { סוג: "weapon", שם: "נשק", אייקון: "⚔️" },

    { סוג: "armor", שם: "שריון", אייקון: "🛡️" },

    { סוג: "helmet", שם: "קסדה", אייקון: "🪖" },

    { סוג: "pants", שם: "מכנסיים", אייקון: "👖" },

    { סוג: "shoes", שם: "נעליים", אייקון: "👢" },

    { סוג: "ring", שם: "טבעת", אייקון: "💍" },

    { סוג: "pendant", שם: "תליון", אייקון: "📿" },

    { סוג: "amulet", שם: "קמע", אייקון: "🔮" }

];


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

        גיבורנבחרלציוד &&

        גיבורים.some(

            ג => ג.id === גיבורנבחרלציוד

        );


    if (
        !עדייןתקף
    ) {

        גיבורנבחרלציוד =

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
                    גיבור.id === גיבורנבחרלציוד
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

                    גיבורנבחרלציוד =
                        גיבור.id;


                    צייררמסךתיק();

                }

            );


            DOM.heroSelector.appendChild(
                כפתור
            );

        }

    );

}


/* =========================================================
   תצוגת משבצות ציוד
========================================================= */

function הצגמשבצותציוד() {

    if (
        !DOM.equipmentSlots
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    const גיבור =
        גיבורים.find(

            ג => ג.id === גיבורנבחרלציוד

        );


    if (
        DOM.equipmentTitle
    ) {

        DOM.equipmentTitle.textContent =

            גיבור
                ? `ציוד מצויד — ${גיבור.שם}`
                : "ציוד מצויד";

    }


    DOM.equipmentSlots.innerHTML =
        "";


    if (
        DOM.equipmentTotals
    ) {

        DOM.equipmentTotals.textContent =
            "";

    }


    if (
        !גיבור
    ) {

        return;

    }


    const חפציםבתיק =
        קבלחפציהשחקן();


    משבצות.forEach(

        משבצת => {

            const instanceId =
                גיבור.equipment
                    ? גיבור.equipment[משבצת.סוג]
                    : null;


            const חפץמצויד =

                instanceId

                    ? חפציםבתיק.find(

                        ח =>
                            ח.instanceId === instanceId

                    )

                    : null;


            const תא =
                document.createElement(
                    "div"
                );

            תא.className =

                "equipment-slot" +

                (חפץמצויד ? " filled" : "");


            תא.innerHTML = `

                <span class="equipment-slot-icon">
                    ${משבצת.אייקון}
                </span>

                <span class="equipment-slot-label">
                    ${ברח_טקסט(משבצת.שם)}
                </span>

                <span class="equipment-slot-value">
                    ${חפץמצויד ? ברח_טקסט(חפץמצויד.שם) : "ריק"}
                </span>

            `;


            if (
                חפץמצויד
            ) {

                const כפתורהסר =
                    document.createElement(
                        "button"
                    );

                כפתורהסר.type =
                    "button";

                כפתורהסר.className =
                    "secondary-button equipment-remove-button";

                כפתורהסר.textContent =
                    "הסר";


                כפתורהסר.addEventListener(

                    "click",

                    () => {

                        הסרציודגיבור(

                            גיבור.id,

                            משבצת.סוג

                        );


                        צייררמסךתיק();

                    }

                );


                תא.appendChild(
                    כפתורהסר
                );

            }


            DOM.equipmentSlots.appendChild(
                תא
            );

        }

    );


    /* ---------------------------------------------
       סיכום סטטים כולל מכל הציוד המצויד
    --------------------------------------------- */

    if (
        DOM.equipmentTotals
    ) {

        const סהכ = {

            attack: 0,

            defense: 0,

            speed: 0,

            hp: 0

        };


        משבצות.forEach(

            משבצת => {

                const instanceId =
                    גיבור.equipment
                        ? גיבור.equipment[משבצת.סוג]
                        : null;


                if (
                    !instanceId
                ) {

                    return;

                }


                const חפץ =
                    חפציםבתיק.find(

                        ח =>
                            ח.instanceId === instanceId

                    );


                if (
                    !חפץ ||
                    !חפץ.בונוסים
                ) {

                    return;

                }


                Object.keys(
                    סהכ
                ).forEach(

                    מפתח => {

                        סהכ[מפתח] +=

                            חפץ.בונוסים[מפתח] || 0;

                    }

                );

            }

        );


        const שורות = [];


        if (
            סהכ.attack !== 0
        ) {

            שורות.push(

                `⚔️ התקפה +${סהכ.attack}`

            );

        }


        if (
            סהכ.defense !== 0
        ) {

            שורות.push(

                `🛡️ הגנה +${סהכ.defense}`

            );

        }


        if (
            סהכ.speed !== 0
        ) {

            שורות.push(

                `💨 מהירות +${סהכ.speed}`

            );

        }


        if (
            סהכ.hp !== 0
        ) {

            שורות.push(

                `❤️ HP +${סהכ.hp}`

            );

        }


        DOM.equipmentTotals.textContent =

            שורות.length > 0
                ? `סה"כ מהציוד: ${שורות.join("  ·  ")}`
                : "אין עדיין בונוסים מציוד מצויד.";

    }

}


/* =========================================================
   תצוגת חפצים בתיק
========================================================= */

function הצגחפציםבתיק() {

    if (
        !DOM.items
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    const גיבור =
        גיבורים.find(

            ג => ג.id === גיבורנבחרלציוד

        );


    const חפציםבתיקמלא =
        קבלחפציהשחקן();


    DOM.items.innerHTML =
        "";


    if (
        חפציםבתיקמלא.length === 0
    ) {

        const ריק =
            document.createElement(
                "p"
            );

        ריק.className =
            "card-tile-description";

        ריק.textContent =
            "התיק ריק. בקרו בחנות כדי לקנות חפצים.";


        DOM.items.appendChild(
            ריק
        );

        return;

    }


    const חפציםבתיק =

        חפציםבתיקמלא.filter(

            ח => {

                if (
                    מסנןנוכחי === "מצויד"
                ) {

                    return !!ח.מוגבלמגיבור;

                }


                if (
                    מסנןנוכחי === "פנוי"
                ) {

                    return !ח.מוגבלמגיבור;

                }


                return true;

            }

        );


    if (
        חפציםבתיק.length === 0
    ) {

        const ריק =
            document.createElement(
                "p"
            );

        ריק.className =
            "card-tile-description";

        ריק.textContent =

            מסנןנוכחי === "מצויד"
                ? "אין כרגע חפצים מצוידים."
                : "כל החפצים שלך מצוידים כרגע.";


        DOM.items.appendChild(
            ריק
        );

        return;

    }


    חפציםבתיק.forEach(

        חפץ => {

            const מצויד =
                !!חפץ.מוגבלמגיבור;

            const מצויעלהגיבורהנבחר =

                גיבור &&
                חפץ.מוגבלמגיבור === גיבור.id;


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "card-tile";


            const בונוסים =
                Object.entries(
                    חפץ.בונוסים || {}
                )

                    .map(

                        ([מפתח, ערך]) =>

                            `+${ערך} ${מפתח}`

                    )

                    .join(" · ");


            card.innerHTML = `

                <div class="card-tile-top">

                    <span class="card-tile-icon">
                        ${אייקוןלסוגחפץ(חפץ.סוג)}
                    </span>

                    <span class="card-tile-cost">
                        ${ברח_טקסט(חפץ.נדירות)}
                    </span>

                </div>

                <h3 class="card-tile-name">
                    ${ברח_טקסט(חפץ.שם)}
                </h3>

                <p class="card-tile-description">
                    ${ברח_טקסט(חפץ.תיאור)}
                </p>

                <div class="card-tile-effects">
                    ${ברח_טקסט(בונוסים)}
                </div>

                ${

                    מצויד
                        ? `<p class="item-equipped-note">מצויד</p>`
                        : ""

                }

            `;


            const פעולות =
                document.createElement(
                    "div"
                );

            פעולות.className =
                "hero-card-actions";


            if (
                גיבור &&
                !מצויעלהגיבורהנבחר
            ) {

                const כפתורצייד =
                    document.createElement(
                        "button"
                    );

                כפתורצייד.type =
                    "button";

                כפתורצייד.className =
                    "hero-add-button";

                כפתורצייד.textContent =

                    מצויד
                        ? "צייד (יוסר מהאחר)"
                        : "צייד";


                כפתורצייד.addEventListener(

                    "click",

                    () => {

                        ציידחפץ(

                            גיבור.id,

                            חפץ.instanceId

                        );


                        צייררמסךתיק();

                    }

                );


                פעולות.appendChild(
                    כפתורצייד
                );

            }


            if (
                !מצויד
            ) {

                const כפתורמכור =
                    document.createElement(
                        "button"
                    );

                כפתורמכור.type =
                    "button";

                כפתורמכור.className =
                    "hero-remove-button";

                כפתורמכור.textContent =
                    "מכור";


                כפתורמכור.addEventListener(

                    "click",

                    () => {

                        בקשאישור(

                            {

                                כותרת:
                                    `למכור את ${חפץ.שם}?`,

                                הודעה:
                                    "לא ניתן לבטל פעולה זו.",

                                טקסטאישור:
                                    "מכור"

                            },

                            אושר => {

                                if (
                                    !אושר
                                ) {

                                    return;

                                }


                                מכורחפץ(
                                    חפץ.instanceId
                                );


                                צייררמסךתיק();

                            }

                        );

                    }

                );


                פעולות.appendChild(
                    כפתורמכור
                );

            }


            card.appendChild(
                פעולות
            );


            DOM.items.appendChild(
                card
            );

        }

    );

}


/* =========================================================
   ציור מלא של המסך
========================================================= */

/* =========================================================
   בורר מיון (הכל / מצויד / פנוי)
========================================================= */

function הצגבוררמיון() {

    if (
        !DOM.filter
    ) {

        return;

    }


    const אפשרויות =
        ["הכל", "מצויד", "פנוי"];


    DOM.filter.innerHTML =
        "";


    אפשרויות.forEach(

        אפשרות => {

            const כפתור =
                document.createElement(
                    "button"
                );

            כפתור.type =
                "button";

            כפתור.className =

                "inventory-filter-item" +

                (
                    אפשרות === מסנןנוכחי
                        ? " selected"
                        : ""
                );

            כפתור.textContent =
                אפשרות;


            כפתור.addEventListener(

                "click",

                () => {

                    מסנןנוכחי =
                        אפשרות;


                    הצגבוררמיון();

                    הצגחפציםבתיק();

                }

            );


            DOM.filter.appendChild(
                כפתור
            );

        }

    );

}


/* =========================================================
   ציור מלא של המסך
========================================================= */

function צייררמסךתיק() {

    הצגבוררגיבורים();

    הצגמשבצותציוד();

    הצגבוררמיון();

    הצגחפציםבתיק();

}


/* =========================================================
   אתחול
========================================================= */

function אתחלממשקתיק() {

    צייררמסךתיק();


    הירשם(

        "גיבורים_נטענו",

        () => {

            צייררמסךתיק();

        }

    );


    הירשם(

        "חפץ_נקנה",

        () => {

            צייררמסךתיק();

        }

    );

}


/* =========================================================
   Export
========================================================= */

export {

    אתחלממשקתיק

};
