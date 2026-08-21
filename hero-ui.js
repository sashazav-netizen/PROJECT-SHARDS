/**
 * =========================================================
 * PROJECT SHARDS
 * Hero UI
 *
 * גרסה: 0.1.0
 *
 * אחראי על:
 * - תצוגת הגיבורים
 * - תצוגת הקבוצה
 * - בחירת גיבור לצפייה
 * - הוספה לקבוצה
 * - הסרה מהקבוצה
 * - עדכון UI בעקבות Events
 *
 * אין כאן Game Logic.
 * אין כאן נתוני גיבורים קבועים.
 * =========================================================
 */


import {

    קבלגיבוריהשחקן,

    קבלגיבוריםלאוסף,

    קבלגיבורי_הקבוצה,

    בחרגיבור,

    הוסףגיבורהקבוצה,

    הסרגיבורהקבוצה,

    הקבוצהמלאה

} from "./hero-system.js";


import {

    קבלסמלגיבור

} from "./hero-data.js";


import {

    הירשם

} from "../core/events.js";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    screen:
        document.getElementById(
            "heroes-screen"
        ),

    collection:
        document.getElementById(
            "heroes-collection"
        ),

    team:
        document.getElementById(
            "heroes-team"
        ),

    selected:
        document.getElementById(
            "selected-hero-details"
        ),

    teamCounter:
        document.getElementById(
            "team-counter"
        )

};


/* =========================================================
   אתחול
========================================================= */

function אתחלממשקגיבורים() {

    if (
        !DOM.screen
    ) {

        console.warn(
            "[Hero UI] מסך הגיבורים לא נמצא."
        );

        return false;

    }


    חבראירועים();


    הצגגיבורים();


    return true;

}


/* =========================================================
   Events
========================================================= */

function חבראירועים() {

    const אירועים = [

        "גיבור_נבחר",

        "גיבור_נוסף_לקבוצה",

        "גיבור_הוסר_מהקבוצה",

        "קבוצת_הגיבורים_השתנתה",

        "גיבור_עלה_רמה",

        "גיבור_קיבל_XP",

        "גיבור_התרפא",

        "גיבור_נפגע",

        "גיבור_נפל",

        "אנרגיה_השתנתה",

        "כוח_שבר_השתנה",

        "גיבור_נפתח",

        "גיבורים_נטענו"

    ];


    for (
        const שםאירוע
        of אירועים
    ) {

        הירשם(
            שםאירוע,
            () => {

                הצגגיבורים();

            }
        );

    }

}


/* =========================================================
   הצגת כל הממשק
========================================================= */

function הצגגיבורים() {

    if (
        !DOM.collection
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריםלאוסף();


    const קבוצה =
        קבלגיבורי_הקבוצה();


    הצגקבוצה(
        קבוצה
    );


    הצגאוסף(
        גיבורים,
        קבוצה
    );


    עדכןמונהקבוצה(
        קבוצה
    );


    הצגגיבורנבחר();

}


/* =========================================================
   Collection
========================================================= */

function הצגאוסף(
    גיבורים,
    קבוצה
) {

    DOM.collection.innerHTML = "";


    for (
        const גיבור
        of גיבורים
    ) {

        if (
            גיבור.locked
        ) {

            const cardנעול =
                צורכרטיסגיבורנעול(
                    גיבור
                );


            DOM.collection.appendChild(
                cardנעול
            );

            continue;

        }


        const בקבוצה =
            קבוצה.some(
                חבר =>
                    חבר.id === גיבור.id
            );


        const card =
            צורכרטיסגיבור(
                גיבור,
                בקבוצה
            );


        DOM.collection.appendChild(
            card
        );

    }

}


/* =========================================================
   Hero Card
========================================================= */

function צורכרטיסגיבור(
    גיבור,
    בקבוצה
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "hero-card";


    if (
        גיבור.selected
    ) {

        card.classList.add(
            "selected"
        );

    }


    if (
        בקבוצה
    ) {

        card.classList.add(
            "in-team"
        );

    }


    const hpPercent =
        חשבאחוז(
            גיבור.stats.hp,
            גיבור.stats.maxHp
        );


    const energyPercent =
        חשבאחוז(
            גיבור.stats.energy,
            גיבור.stats.maxEnergy
        );


    card.innerHTML = `

        <div class="hero-card-top">

            <div class="hero-icon">
                ${קבלסמלגיבור(גיבור)}
            </div>

            <div class="hero-title">

                <h3>
                    ${ברח_טקסט(גיבור.שם)}
                </h3>

                <span class="hero-class">
                    ${ברח_טקסט(גיבור.class)}
                </span>

            </div>

        </div>


        <div class="hero-rarity">
            ${ברח_טקסט(גיבור.נדירות)}
        </div>


        <p class="hero-description">
            ${ברח_טקסט(גיבור.תיאור)}
        </p>


        <div class="hero-level-row">

            <span>
                רמה ${גיבור.progression.level}
            </span>

            <span>
                XP ${גיבור.progression.xp}/${גיבור.progression.xpToNextLevel}
            </span>

        </div>


        <div class="hero-stat-bars">

            <div class="stat-line">

                <div class="stat-label">
                    <span>❤️ HP</span>
                    <b>
                        ${גיבור.stats.hp}/${גיבור.stats.maxHp}
                    </b>
                </div>

                <div class="stat-bar">
                    <span style="width:${hpPercent}%"></span>
                </div>

            </div>


            <div class="stat-line">

                <div class="stat-label">
                    <span>⚡ אנרגיה</span>
                    <b>
                        ${גיבור.stats.energy}/${גיבור.stats.maxEnergy}
                    </b>
                </div>

                <div class="stat-bar energy">
                    <span style="width:${energyPercent}%"></span>
                </div>

            </div>

        </div>


        <div class="hero-numbers">

            <span>
                ⚔️ ${גיבור.stats.attack}
            </span>

            <span>
                🛡️ ${גיבור.stats.defense}
            </span>

            <span>
                💨 ${גיבור.stats.speed}
            </span>

        </div>


        <div class="hero-card-actions">

            <button
                type="button"
                class="hero-view-button"
                data-action="view"
            >
                פרטים
            </button>

            ${
                בקבוצה

                    ? `

                        <button
                            type="button"
                            class="hero-remove-button"
                            data-action="remove"
                        >
                            הסר מהקבוצה
                        </button>

                    `

                    : `

                        <button
                            type="button"
                            class="hero-add-button"
                            data-action="add"
                            ${הקבוצהמלאה() ? "disabled" : ""}
                        >
                            הוסף לקבוצה
                        </button>

                    `
            }

        </div>

    `;


    card.addEventListener(
        "click",
        event => {

            const action =
                event.target.dataset.action;


            if (
                action === "view"
            ) {

                בחרגיבור(
                    גיבור.id
                );

                return;

            }


            if (
                action === "add"
            ) {

                הוסףגיבורהקבוצה(
                    גיבור.id
                );

                return;

            }


            if (
                action === "remove"
            ) {

                הסרגיבורהקבוצה(
                    גיבור.id
                );

            }

        }
    );


    return card;

}


/* =========================================================
   Hero Card — נעול (טרם התגלה)
========================================================= */

function צורכרטיסגיבורנעול(
    גיבור
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "hero-card locked";


    card.innerHTML = `

        <div class="hero-card-locked-icon">
            ❔
        </div>

        <h3 class="hero-title">
            ???
        </h3>

        <div class="hero-rarity">
            ${ברח_טקסט(גיבור.נדירות || "")}
        </div>

        <p class="hero-card-locked-caption">
            עדיין לא פגשת גיבור הזה. המשך במסע כדי לגלות אותו.
        </p>

    `;


    return card;

}


/* =========================================================
   Team
========================================================= */

function הצגקבוצה(
    קבוצה
) {

    if (
        !DOM.team
    ) {

        return;

    }


    DOM.team.innerHTML = "";


    const גודל =
        3;


    for (
        let i = 0;
        i < גודל;
        i++
    ) {

        const גיבור =
            קבוצה[i]
            || null;


        const slot =
            document.createElement(
                "div"
            );


        slot.className =
            "team-slot";


        if (
            גיבור
        ) {

            slot.classList.add(
                "filled"
            );


            slot.innerHTML = `

                <div class="team-slot-icon">
                    ${קבלסמלגיבור(גיבור)}
                </div>

                <div class="team-slot-info">

                    <strong>
                        ${ברח_טקסט(גיבור.שם)}
                    </strong>

                    <span>
                        רמה ${גיבור.progression.level}
                    </span>

                </div>

                <button
                    type="button"
                    data-remove-team="${גיבור.id}"
                    aria-label="הסר ${ברח_טקסט(גיבור.שם)}"
                >
                    ×
                </button>

            `;

        } else {

            slot.innerHTML = `

                <div class="team-empty-icon">
                    +
                </div>

                <span>
                    מקום פנוי
                </span>

            `;

        }


        const removeButton =
            slot.querySelector(
                "[data-remove-team]"
            );


        if (
            removeButton
        ) {

            removeButton.addEventListener(
                "click",
                () => {

                    הסרגיבורהקבוצה(
                        removeButton.dataset.removeTeam
                    );

                }
            );

        }


        DOM.team.appendChild(
            slot
        );

    }

}


/* =========================================================
   Selected Hero
========================================================= */

function הצגגיבורנבחר() {

    if (
        !DOM.selected
    ) {

        return;

    }


    const גיבורים =
        קבלגיבוריהשחקן();


    const גיבור =
        גיבורים.find(
            פריט =>
                פריט.selected
        );


    if (
        !גיבור
    ) {

        DOM.selected.innerHTML = `

            <div class="hero-details-empty">

                <span>
                    ✦
                </span>

                <p>
                    בחר גיבור כדי לראות את הפרטים שלו
                </p>

            </div>

        `;

        return;

    }


    DOM.selected.innerHTML = `

        <div class="selected-hero-header">

            <div class="selected-hero-icon">
                ${קבלסמלגיבור(גיבור)}
            </div>

            <div>

                <span>
                    ${ברח_טקסט(גיבור.נדירות)}
                </span>

                <h2>
                    ${ברח_טקסט(גיבור.שם)}
                </h2>

                <p>
                    ${ברח_טקסט(גיבור.class)}
                </p>

            </div>

        </div>


        <p class="selected-hero-story">
            ${ברח_טקסט(גיבור.סיפור_קצר)}
        </p>


        <div class="selected-hero-stats">

            <div>
                <span>❤️ HP</span>
                <strong>
                    ${גיבור.stats.hp}/${גיבור.stats.maxHp}
                </strong>
            </div>

            <div>
                <span>⚔️ התקפה</span>
                <strong>
                    ${גיבור.stats.attack}
                </strong>
            </div>

            <div>
                <span>🛡️ הגנה</span>
                <strong>
                    ${גיבור.stats.defense}
                </strong>
            </div>

            <div>
                <span>💨 מהירות</span>
                <strong>
                    ${גיבור.stats.speed}
                </strong>
            </div>

            <div>
                <span>⚡ אנרגיה</span>
                <strong>
                    ${גיבור.stats.energy}/${גיבור.stats.maxEnergy}
                </strong>
            </div>

            <div>
                <span>✦ כוח שבר</span>
                <strong>
                    ${גיבור.stats.breakPower}/${גיבור.stats.maxBreakPower}
                </strong>
            </div>

        </div>


        <div class="selected-hero-skills">

            <h3>
                יכולות
            </h3>

            <div class="skill-list">

                ${
                    גיבור.skills
                        .map(
                            skill =>
                                `<span>${ברח_טקסט(skill)}</span>`
                        )
                        .join("")
                }

            </div>

            <div class="hero-specials">

                <span>
                    פסיבי: ${ברח_טקסט(גיבור.passive)}
                </span>

                <span>
                    אולטימטיבי: ${ברח_טקסט(גיבור.ultimate)}
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   Team Counter
========================================================= */

function עדכןמונהקבוצה(
    קבוצה
) {

    if (
        !DOM.teamCounter
    ) {

        return;

    }


    DOM.teamCounter.textContent =
        `${קבוצה.length}/3`;

}


/* =========================================================
   Utilities
========================================================= */

function חשבאחוז(
    ערך,
    מקסימום
) {

    if (
        !Number.isFinite(ערך)
        ||
        !Number.isFinite(מקסימום)
        ||
        מקסימום <= 0
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            (ערך / מקסימום) * 100
        )
    );

}


/**
 * הגנה בסיסית לפני הכנסת טקסט ל־innerHTML.
 */
function ברח_טקסט(
    טקסט
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            טקסט ?? ""
        );


    return div.innerHTML;

}


/* =========================================================
   Export
========================================================= */

export {

    אתחלממשקגיבורים,

    הצגגיבורים

};