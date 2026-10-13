const orbit = {
    cout: (id, value) => {
        const element = document.getElementById(id);
        element.innerHTML = value;
    },
    append: (id, value) => {
        const element = document.getElementById(id);
        element.innerHTML += value;
    },
    getdata: (id) => {
        const element = document.getElementById(id);
        return element;
    },
    getval: (id) => {
        const element = document.getElementById(id);
        return element.value;
    },
    css: (id, property, value) => {
        const element = document.getElementById(id);
        element.style.setProperty(property, value);
    }
};
