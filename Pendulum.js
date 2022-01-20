var id = "eaux_pendulum";
var name = "Pendulum Theory";
var description = "TODO";
var authors = "Eaux Tacous#1021";
var version = 1;

var currency;

var th, v;
var lastChange;

var init = () => {

    currency = theory.createCurrency();

    th = 1;
    dth = 0;

    computeCoeffs();

}

var computeCoeffs, getTh, getDTh;
{
    let f1, f2, c1, c2, d1, d2;

    const b = 0;
    const m = 10;
    const g = 10;
    const l = 5;

    computeCoeffs = () => {

        lastChange = game.statistics.gameTime;

        const X1 = b/m;
        const X2 = g/l;

        if (4 * X2 > X1 * X1) {
            f1 = - X1 / 2;
            f2 = Math.sqrt(X2 - f1 * f1);
            c1 = th;
            c2 = dth/(f1 + f2);
            d1 = c1 * f1 + c2 * f2;
            d2 = c2 * f1 - c1 * f2;
        }

    }

    getTh = (t) => Math.exp(f1*t) * (c1 * Math.cos(f2*t) + c2 * Math.sin(f2*t));

    getDTh = (t) => Math.exp(f1*t) * (d1 * Math.cos(f2*t) + d2 * Math.sin(f2*t));
}

var tick = (elapsedTime, multiplier) => {

    const t = game.statistics.gameTime - lastChange;
    const t = elapsedTime * multiplier;

    th = getTh(t);
    dth = getDTh(t);

    computeCoeffs();

}

var thToVec = (th) => {
    const x = Math.sin(th);
    const y = Math.cos(th)-0.25;
    const z = 0;
    return Vector3(x, y, z);
}

var get3DGraphPoint = () => thToVec(th);

init();