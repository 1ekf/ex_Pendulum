var id = "eaux_pendulum";
var name = "Pendulum Theory";
var description = "TODO";
var authors = "Eaux Tacous#1021";
var version = 2;

var currency;

var th, v;

var init = () => {

    currency = theory.createCurrency();

    th = 1;
    dth = 0;
    nudge = 0;


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

    const grid = ui.createGrid({
        children: [leftButton, rightButton]
    })

    return grid;
}


var computeCoeffs, computeCoeffs2, getTh, getDTh;
{

    const b = 2;
    const m = 10;
    const g = 10;
    const l = 5;

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
    const x = Math.sin(th);
    const y = Math.cos(th)-0.25;
    const z = 0;
    return Vector3(x, y, z);
}

var get3DGraphPoint = () => thToVec(th);
var getTertiaryEquation = () => th.toString();

init();