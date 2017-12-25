import { BadQueryError } from "../../src/framework/errors/BadQueryError"
import { Filter } from "../../src/framework/data/Filter"
import { Query } from "../../src/framework/data/Query"
import { expect } from "chai"

interface TestInterface {
    id: string
    tenant_id: string
    test_id: number
    company_id: number
    more_test_ids: string
    random_id: string
    TestMultiCaseVariable: string
    RandomThing: string
    Random: string
}

suite("Query", () => {
    suite("buildToMySQL", () => {
        test("Single line selector", () => {
            const test_filter: Filter<TestInterface> = [
                ["id", "=", "Hello World"],
            ]

            const [query, parameters] = Query.buildToMySQL(test_filter)

            expect(query).to.equal("( ?? = ? )")
            expect(parameters).to.deep.equal(["id", "Hello World"])
        })

        test("Multi line selector", () => {
            const test_filter: Filter<TestInterface> = [
                ["id", "=", 15],
                ["tenant_id", "=", "Test ID"],
            ]

            const [query, parameters] = Query.buildToMySQL(test_filter)

            expect(query).to.equal("( ?? = ? ) AND ( ?? = ? )")
            expect(parameters).to.deep.equal(["id", 15, "tenant_id", "Test ID"])
        })

        test("Simple concatenation operators", () => {
            const test_filter: Filter<TestInterface> = [
                ["id", "=", 15],
                ["test_id", "=", 11],
                "OR",
                ["more_test_ids", "=", 12],
                ["random_id", "!=", 13],
            ]

            const [query, parameters] = Query.buildToMySQL(test_filter)

            expect(query).to.equal(
                "( ?? = ? ) AND ( ?? = ? OR ?? = ? ) AND ( ?? != ? )"
            )
            expect(parameters).to.deep.equal([
                "id",
                15,
                "test_id",
                11,
                "more_test_ids",
                12,
                "random_id",
                13,
            ])
        })

        test("Multiple concatenation selectors with array", () => {
            const test_filter: Filter<TestInterface> = [
                ["id", "IN", ["a", "b", "c", "d"]],
                "OR",
                ["company_id", "=", 123],
                ["TestMultiCaseVariable", "!=", null],
                "AND",
                ["RandomThing", "=", null],
                ["Random", "NOT IN", ["a"]],
            ]

            const [query, parameters] = Query.buildToMySQL(test_filter)

            expect(query).to.equal(
                "( ?? IN (?) OR ?? = ? ) AND ( ?? IS NOT NULL ) AND ( ?? IS NULL ) AND ( ?? NOT IN (?) )"
            )
            expect(parameters).to.deep.equal([
                "id",
                ["a", "b", "c", "d"],
                "company_id",
                123,
                "TestMultiCaseVariable",
                "RandomThing",
                "Random",
                ["a"],
            ])
        })

        test("IN operator should throw an error when provided with an empty array", () => {
            const test_filter: Filter<TestInterface> = [["id", "IN", []]]

            expect(() => Query.buildToMySQL(test_filter)).to.throw(
                BadQueryError
            )
        })
    })
})
