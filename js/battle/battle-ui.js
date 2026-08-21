/**
 * =========================================================
 * PROJECT SHARDS
 * Battle UI
 *
 * גרסה: 0.1.0
 *
 * אחראי על:
 * - רשימת בחירת יריבים במסך הבית
 * - תצוגת מסך הקרב החי (HP, Energy, יד, לוג)
 * - תצוגת מסך תוצאה (ניצחון/הפסד)
 *
 * אין כאן Game Logic — כל הלוגיקה ב-battle-system.js.
 * =========================================================
 */


import {

    נתוני_אויבים

} from "./battle-data.js";


import {

    התחלקרב,

    שחקקלףבקרב,

    סייםתורשחקן,

    קבלמצבקרב,

    בקרב,

    אפסקרב

} from "./battle-system.js";


import {

    קבלגיבורנבחר,

    קבלגיבורי_הקבוצה,

    קבלגיבוריהשחקן

} from "../heroes/hero-system.js";


import {

    קבלסמלגיבור

} from "../heroes/hero-data.js";


import {

    קבליד

} from "../cards/card-system.js";


import {

    הירשם

} from "../core/events.js";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    enemyList:
        document.getElementById(
            "enemy-select-list"
        ),

    enemyName:
        document.getElementById(
            "battle-enemy-name"
        ),

    enemyHpFill:
        document.getElementById(
            "battle-enemy-hp-fill"
        ),

    enemyHpText:
        document.getElementById(
            "battle-enemy-hp-text"
        ),

    heroName:
        document.getElementById(
            "battle-hero-name"
        ),

    heroHpFill:
        document.getElementById(
            "battle-hero-hp-fill"
        ),

    heroHpText:
        document.getElementById(
            "battle-hero-hp-text"
        ),

    heroEnergyText:
        document.getElementById(
            "battle-hero-energy-text"
        ),

    hand:
        document.getElementById(
            "battle-hand"
        ),

    log:
        document.getElementById(
            "battle-log"
        ),

    endTurnButton:
        document.getElementById(
            "battle-end-turn-button"
        ),

    resultOverlay:
        document.getElementById(
            "battle-result-overlay"
        ),

    resultTitle:
        document.getElementById(
            "battle-result-title"
        ),

    resultDetails:
        document.getElementById(
            "battle-result-details"
        ),

    leaveButton:
        document.getElementById(
            "battle-leave-button"
        )

};


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
   אירוע יציאה למסך הקרב
   (game.js מאזין לזה כדי לעבור מסך)
========================================================= */

let מאזיני_מעבר_מסך = [];


function עלמעברלמסךקרב(
    callback
) {

    מאזיני_מעבר_מסך.push(
        callback
    );

}


function הפעלמעברמסך() {

    מאזיני_מעבר_מסך.forEach(

        cb => cb()

    );

}


/* =========================================================
   רשימת בחירת יריבים (מסך הבית)
========================================================= */

function הצגרשימתיריבים() {

    if (
        !DOM.enemyList
    ) {

        return;

    }


    DOM.enemyList.innerHTML =
        "";


    Object.keys(
        נתוני_אויבים
    ).forEach(

        מפתח => {

            const אויב =
                נתוני_אויבים[
                    מפתח
                ];


            const כפתור =
                document.createElement(
                    "button"
                );

            כפתור.type =
                "button";

            כפתור.className =
                "enemy-select-item";


            כפתור.innerHTML = `

                <span class="enemy-select-icon">
                    ${ברח_טקסט(אויב.אייקון || "👾")}
                </span>

                <span class="enemy-select-name">
                    ${ברח_טקסט(אויב.שם)}
                </span>

                <span class="enemy-select-meta">
                    ${ברח_טקסט(אויב.רמת_קושי)} ·
                    ❤️ ${אויב.stats.hp} ·
                    ⚔️ ${אויב.stats.attack}
                </span>

            `;


            כפתור.addEventListener(

                "click",

                () => {

                    התחלקרבחדש(
                        מפתח
                    );

                }

            );


            DOM.enemyList.appendChild(
                כפתור
            );

        }

    );

}


/* =========================================================
   התחלת קרב חדש (מהמסך הראשי)
========================================================= */

function בחרגיבורלקרב() {

    const נבחר =
        קבלגיבורנבחר();


    if (
        נבחר
    ) {

        return נבחר;

    }


    const קבוצה =
        קבלגיבורי_הקבוצה();


    if (
        קבוצה.length > 0
    ) {

        return קבוצה[0];

    }


    const כולם =
        קבלגיבוריהשחקן();


    return כולם.length > 0
        ? כולם[0]
        : null;

}


function התחלקרבחדש(
    מפתחאויב
) {

    const גיבור =
        בחרגיבורלקרב();


    if (
        !גיבור
    ) {

        console.warn(
            "[Battle UI] אין גיבור זמין לקרב."
        );

        return;

    }


    const הצליח =
        התחלקרב(

            גיבור.id,

            מפתחאויב

        );


    if (
        !הצליח
    ) {

        console.warn(
            "[Battle UI] לא ניתן היה להתחיל קרב."
        );

        return;

    }


    if (
        DOM.resultOverlay
    ) {

        DOM.resultOverlay.classList.add(
            "hidden"
        );

    }


    צייררקרב();

    הפעלמעברמסך();

}


/* =========================================================
   ציור מלא של מצב הקרב
========================================================= */

function צייררקרב() {

    const מצב =
        קבלמצבקרב();


    if (
        !מצב
    ) {

        return;

    }


    /* ---------------------------------------------
       אויב
    --------------------------------------------- */

    if (
        DOM.enemyName
    ) {

        DOM.enemyName.textContent =

            `${מצב.אויב.אייקון || "👾"} ${מצב.אויב.שם}`;

    }


    const אחוזאויב =

        Math.max(

            0,

            Math.round(

                (מצב.אויב.stats.hp / מצב.אויב.stats.maxHp) * 100

            )

        );


    if (
        DOM.enemyHpFill
    ) {

        DOM.enemyHpFill.style.width =

            `${אחוזאויב}%`;

    }


    if (
        DOM.enemyHpText
    ) {

        DOM.enemyHpText.textContent =

            `${Math.max(0, מצב.אויב.stats.hp)} / ${מצב.אויב.stats.maxHp}`;

    }


    /* ---------------------------------------------
       גיבור
    --------------------------------------------- */

    if (
        מצב.גיבור
    ) {

        if (
            DOM.heroName
        ) {

            DOM.heroName.textContent =

                `${קבלסמלגיבור(מצב.גיבור)} ${מצב.גיבור.שם}`;

        }


        const אחוזגיבור =

            Math.max(

                0,

                Math.round(

                    (מצב.גיבור.stats.hp / מצב.גיבור.stats.maxHp) * 100

                )

            );


        if (
            DOM.heroHpFill
        ) {

            DOM.heroHpFill.style.width =

                `${אחוזגיבור}%`;

        }


        if (
            DOM.heroHpText
        ) {

            DOM.heroHpText.textContent =

                `${Math.max(0, מצב.גיבור.stats.hp)} / ${מצב.גיבור.stats.maxHp}`;

        }


        if (
            DOM.heroEnergyText
        ) {

            DOM.heroEnergyText.textContent =

                `⚡ ${מצב.גיבור.stats.energy} / ${מצב.גיבור.stats.maxEnergy}` +

                (מצב.הגנה > 0 ? ` · 🛡️ ${מצב.הגנה}` : "");

        }

    }


    /* ---------------------------------------------
       יד
    --------------------------------------------- */

    ציוריד(
        מצב
    );


    /* ---------------------------------------------
       לוג
    --------------------------------------------- */

    if (
        DOM.log
    ) {

        DOM.log.innerHTML =

            מצב.לוג

                .slice(-6)

                .map(

                    שורה =>

                        `<p>${ברח_טקסט(שורה)}</p>`

                )

                .join("");


        DOM.log.scrollTop =
            DOM.log.scrollHeight;

    }


    /* ---------------------------------------------
       כפתורים פעילים רק בתור שחקן
    --------------------------------------------- */

    const תורשחקן =

        מצב.פאזה === "שחקן" &&
        !מצב.תוצאה;


    if (
        DOM.endTurnButton
    ) {

        DOM.endTurnButton.disabled =
            !תורשחקן;

    }


    /* ---------------------------------------------
       תוצאה
    --------------------------------------------- */

    if (
        מצב.תוצאה
    ) {

        הצגתוצאתקרב(
            מצב
        );

    }

}


/* =========================================================
   ציור יד הקלפים
========================================================= */

function ציוריד(
    מצב
) {

    if (
        !DOM.hand
    ) {

        return;

    }


    DOM.hand.innerHTML =
        "";


    const תורשחקן =

        מצב.פאזה === "שחקן" &&
        !מצב.תוצאה;


    קבליד().forEach(

        קלף => {

            const אפשראפשרי =

                תורשחקן &&
                מצב.גיבור &&
                מצב.גיבור.stats.energy >= קלף.עלות;


            const כרטיס =
                document.createElement(
                    "button"
                );

            כרטיס.type =
                "button";

            כרטיס.className =

                "battle-card" +

                (אפשראפשרי ? "" : " disabled");


            const אפקטים = [];


            if (
                קלף.נזק > 0
            ) {

                אפקטים.push(

                    `⚔️${קלף.נזק}`

                );

            }


            if (
                קלף.הגנה > 0
            ) {

                אפקטים.push(

                    `🛡️${קלף.הגנה}`

                );

            }


            if (
                קלף.ריפוי > 0
            ) {

                אפקטים.push(

                    `❤️${קלף.ריפוי}`

                );

            }


            כרטיס.innerHTML = `

                <span class="battle-card-cost">
                    ${קלף.עלות}⚡
                </span>

                <span class="battle-card-name">
                    ${ברח_טקסט(קלף.שם)}
                </span>

                <span class="battle-card-effects">
                    ${אפקטים.join(" ")}
                </span>

            `;


            if (
                אפשראפשרי
            ) {

                כרטיס.addEventListener(

                    "click",

                    () => {

                        שחקקלףבקרב(
                            קלף.instanceId
                        );

                        צייררקרב();

                    }

                );

            }


            DOM.hand.appendChild(
                כרטיס
            );

        }

    );

}


/* =========================================================
   סיום תור
========================================================= */

function טפלסיוםתור() {

    if (
        !בקרב()
    ) {

        return;

    }


    סייםתורשחקן();

    צייררקרב();

}


/* =========================================================
   הצגת תוצאת קרב
========================================================= */

function הצגתוצאתקרב(
    מצב
) {

    if (
        !DOM.resultOverlay
    ) {

        return;

    }


    DOM.resultOverlay.classList.remove(
        "hidden"
    );


    const ניצחון =
        מצב.תוצאה === "ניצחון";


    if (
        DOM.resultTitle
    ) {

        DOM.resultTitle.textContent =

            ניצחון
                ? "ניצחת!"
                : "נפלת בקרב";

    }


    if (
        DOM.resultDetails
    ) {

        DOM.resultDetails.textContent =

            ניצחון

                ? `+${מצב.אויב.תגמול?.כסף || 0} כסף · +${מצב.אויב.תגמול?.ניסיון || 0} ניסיון`

                : "אולי בפעם הבאה. כדאי לחזק את הגיבור לפני שמנסים שוב.";

    }

}


/* =========================================================
   יציאה מהקרב
========================================================= */

function טפליציאהמקרב() {

    const מצבלפניאיפוס =
        קבלמצבקרב();

    const מקור =

        מצבלפניאיפוס
            ? מצבלפניאיפוס.מקור
            : "רגיל";


    אפסקרב();


    if (
        DOM.resultOverlay
    ) {

        DOM.resultOverlay.classList.add(
            "hidden"
        );

    }


    פרסםיציאה(
        מקור
    );

}


let מאזיני_יציאה = [];


function עלחזרהממסךקרב(
    callback
) {

    מאזיני_יציאה.push(
        callback
    );

}


function פרסםיציאה(
    מקור
) {

    מאזיני_יציאה.forEach(

        cb => cb(מקור)

    );

}


/* =========================================================
   אתחול
========================================================= */

function אתחלממשקקרב() {

    הצגרשימתיריבים();


    if (
        DOM.endTurnButton
    ) {

        DOM.endTurnButton.addEventListener(

            "click",

            טפלסיוםתור

        );

    }


    if (
        DOM.leaveButton
    ) {

        DOM.leaveButton.addEventListener(

            "click",

            טפליציאהמקרב

        );

    }


    /* ---------------------------------------------
       רענון רשימת יריבים כשגיבורים משתנים
       (כדי לתמוך בגיבור חדש/רמה חדשה בעתיד)
    --------------------------------------------- */

    הירשם(

        "גיבורים_נטענו",

        () => {

            הצגרשימתיריבים();

        }

    );

}


/* =========================================================
   Export
========================================================= */

export {

    אתחלממשקקרב,

    עלמעברלמסךקרב,

    עלחזרהממסךקרב,

    הפעלמעברמסך,

    צייררקרב

};
