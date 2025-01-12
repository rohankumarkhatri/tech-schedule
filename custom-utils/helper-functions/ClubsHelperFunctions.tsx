const TABLE_SIZE = 10000000;

/**                                             
 * Polynomial rolling hash function in JavaScript.
 * 
 * @param {string} clubName - The club name to be hashed.
 * @param {number} [base=31] - A small prime base used for hashing.
 * @returns {number} - The computed hash value (index).     
 */
export function hashFunctionPolynomial(clubName: string, base: number = 31): number {
    let hashValue = 0;
    for (let i = 0; i < clubName.length; i++) {
        hashValue = (hashValue * base + clubName.charCodeAt(i)) % TABLE_SIZE;
    }
    return hashValue;
}