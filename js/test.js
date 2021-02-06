describe('Testing integers', ()=>{
    it('Value should equal', () => {
        let value = 1;
        let int1 = new Integer(value);
        expect(int1.value).toBe(value);
    });
    it('Integers should equal', () => {
        let value = 1;
        let int1 = new Integer(value);
        let int2 = new Integer(value);
        expect(int1.equals(int2)).toBeTruthy();
    });
})

describe('Testing sums', ()=>{
    it('Sum should equal', () => {
        let sum1 = new Sum(new Integer(1), new Integer(2));
        let sum2 = new Sum(new Integer(1), new Integer(2));
        expect(sum1.equals(sum2)).toBeTruthy();
    });
    it('Commuted sum should equal', () => {
        let sum1 = new Sum(new Integer(1), new Integer(2));
        let sum2 = new Sum(new Integer(2), new Integer(1));
        expect(sum1.equals(sum2)).toBeTruthy();
    });
})

describe('Testing sums simplifier', ()=>{
    it('Integer sum should simplify', () => {
        let sum = new Sum(new Integer(1), new Integer(2));
        let ss = SumSimplifier.process(sum);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(3);
    });
    it('Integer sum should cancel', () => {
        let sum = new Sum(new Integer(1), new Integer(-1));
        let ss = SumSimplifier.process(sum);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(0);
    });
    it('Multiple Integer sum should simplify', () => {
        let sum = new Sum(new Integer(1), new Sum(new Integer(2), new Integer(3)));
        let ss = SumSimplifier.process(sum);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(6);
    });
    it('Mixed integer variable sum should simplify', () => {
        let sum = new Sum(new Integer(1), new Sum(new Integer(2), new Variable("x")));
        let ss = SumSimplifier.process(sum);
        expect(ss.sumList.length).toBe(2);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(3);
        expect(ss.sumList[1] instanceof Variable).toBeTruthy();
        expect(ss.sumList[1].name).toBe("x");
    });
    it('Integer subtraction should simplify', () => {
        let subtraction = new Subtraction(new Integer(2), new Integer(1));
        let ss = SumSimplifier.process(subtraction);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(1);
    });
    it('Integer subtraction should cancel', () => {
        let subtraction = new Subtraction(new Integer(1), new Integer(1));
        let ss = SumSimplifier.process(subtraction);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(0);
    });
    it('Integer multiple subtraction should simplify', () => {
        let subtraction = new Subtraction(new Integer(1), new Subtraction(new Integer(2), new Integer(3)));
        let ss = SumSimplifier.process(subtraction);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(2);
    });
    it('Integer multiple subtraction should simplify', () => {
        let subtraction = new Subtraction(new Integer(1), new Subtraction(new Integer(2), new Integer(3)));
        let ss = SumSimplifier.process(subtraction);
        expect(ss.sumList.length).toBe(1);
        expect(ss.sumList[0] instanceof Integer).toBeTruthy();
        expect(ss.sumList[0].value).toBe(2);
    });
})