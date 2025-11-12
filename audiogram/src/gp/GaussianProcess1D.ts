import { Matrix, CholeskyDecomposition, solve } from "ml-matrix"

type Obs = { xLog: number; yDb: number }
export type GPParams = { sigmaF: number; ell: number; sigmaN: number }

export class GaussianProcess1D {
    private obs: Obs[] = []
    private K?: Matrix 
    private L?: Matrix // cholesky factor of K
    private alpha?: Matrix 
    private params: GPParams

    constructor(params: GPParams = { sigmaF: 40, ell: 0.6, sigmaN: 3 }) {
        this.params = params
    }

    // x = log2(f/1000)
    static toXLog(fHz: number) {
        return Math.log2(fHz / 1000)
    }

    add(fHz: number, yDb: number) {
        this.obs.push({ xLog: GaussianProcess1D.toXLog(fHz), yDb })
        this.L = this.alpha = this.K = undefined // invalidate
    }

    private rbf(a: number, b: number) {
        const { sigmaF, ell } = this.params
        const d = a - b
        return sigmaF * sigmaF * Math.exp(-(d * d) / (2 * ell * ell))
    }

    fit() {
        const n = this.obs.length
        if (n === 0) return
        const { sigmaN } = this.params

        const K = Matrix.zeros(n, n)
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                K.set(
                    i,
                    j,
                    this.rbf(this.obs[i].xLog, this.obs[j].xLog) +
                        (i === j ? sigmaN * sigmaN : 0)
                )
            }
        }
        // jitter for numerical stability
        for (let i = 0; i < n; i++) K.set(i, i, K.get(i, i) + 1e-6)

        const y = Matrix.columnVector(this.obs.map(o => o.yDb))
        const chol = new CholeskyDecomposition(K)
        const L = chol.lowerTriangularMatrix

        //solve using lower triangular
        const v = solve(L, y)
        const alpha = solve(L.transpose(), v)

        this.K = K
        this.L = L
        this.alpha = alpha
    }

    predictAt(fHz: number) {
        if (!this.alpha || !this.L) this.fit()
        if (!this.alpha || !this.L) throw new Error("No data")

        const xStar = GaussianProcess1D.toXLog(fHz)
        const n = this.obs.length


        const kstar = Matrix.columnVector(this.obs.map(o => this.rbf(xStar, o.xLog)))

        const mean = kstar.transpose().mmul(this.alpha!).get(0, 0)

        const v = solve(this.L, kstar)
        const kss = this.rbf(xStar, xStar)
        const var_ = Math.max(0, kss - v.transpose().mmul(v).get(0, 0))

        return { mean, std: Math.sqrt(var_) }
    }

    // choose the candidate freq with largest posterior std 
    nextFrequency(candidatesHz: number[]) {
        let best = candidatesHz[0],
            bestStd = -Infinity
        for (const f of candidatesHz) {
            const { std } = this.predictAt(f)
            if (std > bestStd) {
                bestStd = std
                best = f
            }
        }
        return { fHz: best, estUncDb: bestStd }
    }

    get points() {
        return this.obs.slice()
    }
}
