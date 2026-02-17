const NotificationStandards = {
    error: {
        classes: `
      bg-red-900
      text-red-200
      border-red-500
    `,
        defaultMsg: "Ocorreu um erro",
    },
    success: {
        classes: `
      bg-emerald-900
      text-emerald-200
      border-emerald-500
    `,
        defaultMsg: "Sucesso na requisição!",
    },
    warning: {
        classes: `
      bg-yellow-900
      text-yellow-200
      border-yellow-500
    `,
        defaultMsg: "Algum aviso foi lançado",
    },
    info: {
        classes: `
      bg-blue-900
      text-blue-200
      border-blue-500
    `,
        defaultMsg: "Nenhuma alteração feita",
    },
};

const notifications = [];
const root = document.getElementById("notification-root");

function genId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}


/**
 * 
 * @param {"success" | "info" | "error" | "warning"} type 
 * @param {string} msg 
 * @returns 
 */
function notify(type, msg) {
    if (msg && notifications.some(n => n.msg === msg)) return;

    const id = genId();

    const notification = {
        id,
        type,
        msg,
        isVisible: false,
        isFading: false
    };

    notifications.push(notification);
    render();

    setTimeout(() => {
        notification.isVisible = true;
        render();
    }, 10);

    setTimeout(() => destroy(id), 5000);
}

function destroy(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return;

    notifications[index].isFading = true;
    render();

    setTimeout(() => {
        notifications.splice(index, 1);
        render();
    }, 300);
}

function render() {
    root.innerHTML = "";

    notifications.forEach((obj) => {
        const standard = NotificationStandards[obj.type];
        const msg = obj.msg || standard.defaultMsg;

        const el = document.createElement("div");
        el.setAttribute("role", "alert");
        el.className = `
      flex gap-4 items-center px-5 py-3.5 max-w-full rounded-lg
      transition-all duration-300 ease-in-out transform
      border-l-8 ${standard.classes}
      ${obj.isVisible && !obj.isFading
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"}
    `;

        el.innerHTML = `
      <span class="font-semibold">${msg}</span>
      <button
        aria-label="Close notification"
        class="ml-auto text-lg hover:opacity-80"
      >
        ✕
      </button>
    `;

        el.querySelector("button").onclick = () => destroy(obj.id);

        root.appendChild(el);
    });
}