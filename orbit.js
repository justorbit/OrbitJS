function cout(id, data) {
    var output = document.getElementById(id);
    output.innerHTML = data;
}

function append(id, data) {
    var output = document.getElementById(id);
    output.innerHTML += data;
}

function getdata(id) {
    var data = document.getElementById(id);
    return data.innerHTML;
}

function getval(id) {
    var val = document.getElementById(id);
    return val.value;
}

function setval(id, val) {
    var output = document.getElementById(id);
    output.value = val;
}

function style(id, name, value) {
    var ele = document.getElementById(id);
    ele.style[name] = value;
}

function getstyle(id) {
    var ele = document.getElementById(id);
    return ele.style;
}

function lstore(key, value) {
    localStorage.setItem(key, value);
}

function lread(key) {
    return localStorage.getItem(key);
}

function lrm(key) {
    localStorage.removeItem(key);
}

function lcls() {
    localStorage.clear();
}

function lappend(key, value) {
    var data = localStorage.getItem(key);

    if (data !== null) {
        localStorage.setItem(key, data + value);
    } else {
        localStorage.setItem(key, value);
    }
}
// const URL = "https://YOUR_PROJECT.supabase.co";
// const KEY = "YOUR_PUBLISHABLE_KEY";
// const TABLE = "users";

async function API(method, query = "", data = null) {
    try {
        const res = await fetch(`${URL}/rest/v1/${TABLE}${query}`, {
            method,
            headers: {
                "apikey": KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: data ? JSON.stringify(data) : null
        });

        const result = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error: result.message || "Unknown error",
                code: result.code
            };
        }

        return {
            success: true,
            data: result
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// CREATE
async function POST(column, value) {
    return await API("POST", "", {[column]: value});
}

// READ
async function GET(column, value) {
    let query = `?select=*`;

    if (value !== undefined) {
        query += `&${column}=eq.${encodeURIComponent(value)}`;
    }

    return await API("GET", query);
}

// UPDATE
async function PUT(id, column, value) {
    return await API("PATCH", `?id=eq.${encodeURIComponent(id)}`, {[column]: value});
}

// DELETE
async function DELETE(id) {
    return await API("DELETE", `?id=eq.${encodeURIComponent(id)}`);
}
