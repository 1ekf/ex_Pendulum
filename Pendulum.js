var id = "eaux_pendulum";
var name = "Pendulum Theory";
var description = "TODO";
var authors = "Eaux Tacous#1021";
var version = 3;

var currency;

var th, v;
var b, m, g, l;

var init = () => {

    currency = theory.createCurrency();

    th = 1;
    dth = 0;
    nudge = 0;

    b = 2;
    m = 10;
    g = 10;
    l = 5;

}

var getUpgradeListDelegate = () => {

    let leftButton = ui.createButton({
        text: 'nudge left\n(clockwise)',
        row: 0,
        column: 0
    })

    leftButton.onTouched = (e) => {
        nudge = e.type.isReleased() ? 0 : -0.5;
    }

    let rightButton = ui.createButton({
        text: 'nudge right\n(counterclockwise)',
        row: 0,
        column: 1
    })

    rightButton.onTouched = (e) => {
        nudge = e.type.isReleased() ? 0 : 0.5;
    }

    let lengthDown = ui.createButton({
        text: 'decrease length\n',
        row: 1,
        column: 0
    })
    lengthDown.onClicked = () => {
        l = Math.max(l-1, 2);
    }

    let lengthUp = ui.createButton({
        text: 'increase length\n',
        row: 1,
        column: 1
    })
    lengthUp.onClicked = () => {
        l = Math.min(l+1, 10);
    }

    let gravDown = ui.createButton({
        text: 'decrease gravity\n',
        row: 2,
        column: 0
    })
    gravDown.onClicked = () => {
        g = Math.max(g-2, 0);
    }

    let gravUp = ui.createButton({
        text: 'increase gravity\n',
        row: 2,
        column: 1
    })
    gravUp.onClicked = () => {
        g = Math.min(g+2, 20);
    }

    const grid = ui.createGrid({
        children: [leftButton, rightButton, lengthDown, lengthUp, gravDown, gravUp]
    })

    return grid;
}


var computeCoeffs, computeCoeffs2, getTh, getDTh;
{

    const stepWeights = [0, 1/2, 1/2, 1];
    const finalWeights = [1/6, 1/3, 1/3, 1/6];

    const add = (a, b) => a+b;

    // Algorithm source: https://willbeason.com/2021/06/25/improve-your-runge-kutta-nystrom-algorithms-with-this-one-weird-trick/
    const RK4N = (t0, y0, yp0, h, f) => {

        let yps = [];
        let ks = [];
        let prevk;

        const ypp0 = f(t0, y0, yp0);
        yps.push(yp0);
        ks.push(ypp0);
        prevk = ypp0;

        for (let idx = 1; idx < stepWeights.length; idx++) {

            const dt = h * stepWeights[idx];
            const dyp = prevk * dt;
            const dy = dt * (yp0 + dyp/3 + dt*ypp0/6);

            ks.push(f(t0+dt, y0+dy, yp0+dyp));
            yps.push(yp0+dyp);

        }

        const yp1 = yp0 + ks.map((k, i) => h * finalWeights[i] * k).reduce(add, 0);
        const y1 = y0 + yps.map((y, i) => h * finalWeights[i] * y).reduce(add, 0);

        return [y1, yp1];

    }

    const f = (t, y, yp) => {

        return -(g/l * Math.sin(y) + b/m * yp) + nudge;
    }

    computeCoeffs = (timeElapsed) => {
        const res = RK4N(0, th, dth, timeElapsed, f);
        [th, dth] = res;
    }

}

var tick = (elapsedTime, multiplier) => {

    const t = elapsedTime * multiplier;

    const steps = Math.ceil(t * 5);

    for (let i = 0; i < steps; i++) computeCoeffs(t/steps);

    th = (th + Math.PI) % (2 * Math.PI) - Math.PI;

    theory.invalidateTertiaryEquation();

}

var thToVec = (th) => {
    const x = (l * Math.sin(th)) * 0.1;
    const y = (l * Math.cos(th)) * 0.1 - 0.25;
    const z = 0;
    return Vector3(x, y, z);
}

var get3DGraphPoint = () => thToVec(th);
var getTertiaryEquation = () => `g = ${g} \\quad l = ${l} \\quad \\theta = ${th.toFixed(2)} \\quad d\\theta = ${dth.toFixed(2)}`

init();