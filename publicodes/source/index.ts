/* eslint-disable @typescript-eslint/ban-types */
import { map } from 'ramda'
import { evaluationError, warning } from './error'
import { evaluateNode } from './evaluation'
import { convertNodeToUnit, simplifyNodeUnit } from './nodeUnits'
import { parse } from './parse'
import parseRules from './parseRules'
import { EvaluatedNode, EvaluatedRule, ParsedRules, Rules } from './types'
import { parseUnit } from './units'
import * as utils from './ruleUtils'

const emptyCache = () => ({
	_meta: { contextRule: [] }
})

type Cache = {
	_meta: {
		contextRule: Array<string>
		inversionFail?: {
			given: string
			estimated: string
		}
	}
}

type ParsedSituation<Names extends string> = Partial<ParsedRules<Names>>

export type EvaluationOptions = Partial<{
	unit: string
}>

export * from './components'
export { formatValue, serializeValue } from './format'
export { default as translateRules } from './translateRules'
export { default as cyclesLib } from './cyclesLib/index'
export * from './types'
export { parseRules }
export { utils }

export default class Engine<Names extends string> {
	parsedRules: ParsedRules<Names>
	parsedSituation: ParsedSituation<Names> = {}
	private cache: Cache
	private warnings: Array<string> = []

	constructor(rules: string | Rules<Names> | ParsedRules<Names>) {
		this.cache = emptyCache()
		this.parsedRules =
			typeof rules === 'string' || !(Object.values(rules)[0] as any)?.dottedName
				? parseRules(rules)
				: (rules as ParsedRules<Names>)
	}

	private resetCache() {
		this.cache = emptyCache()
	}

	private evaluateExpression(
		expression: string,
		context: string
	): EvaluatedRule<Names> {
		// EN ATTENDANT d'AVOIR une meilleure gestion d'erreur, on va mocker
		// console.warn
		const originalWarn = console.warn
		console.warn = (warning: string) => {
			this.warnings.push(warning)
			originalWarn(warning)
		}
		const result = simplifyNodeUnit(
			evaluateNode(
				this.cache,
				this.parsedSituation,
				this.parsedRules,
				parse(
					this.parsedRules,
					{ dottedName: context },
					this.parsedRules
				)(expression)
			)
		)
		console.warn = originalWarn

		if (Object.keys(result.defaultValue?.missingVariable ?? {}).length) {
			throw evaluationError(
				context,
				"Impossible d'évaluer l'expression car celle ci fait appel à des variables manquantes"
			)
		}
		return result
	}

	setSituation(
		situation: Partial<Record<Names, string | number | object>> = {}
	) {
		this.resetCache()
		this.parsedSituation = map(
			value =>
				typeof value === 'object'
					? value
					: parse(
							this.parsedRules,
							{ dottedName: '' },
							this.parsedRules
					  )(value),
			situation
		)
		return this
	}

	evaluate(expression: Names, options?: EvaluationOptions): EvaluatedRule<Names>
	evaluate(
		expression: string,
		options?: EvaluationOptions
	): EvaluatedNode<Names> | EvaluatedRule<Names>
	evaluate(expression: string, options?: EvaluationOptions) {
		let result = this.evaluateExpression(
			expression,
			`[evaluation] ${expression}`
		)
		if (result.category === 'reference' && result.explanation) {
			result = {
				...result.explanation,
				nodeValue: result.nodeValue,
				missingVariables: result.missingVariables,
				...('unit' in result && { unit: result.unit }),
				...('temporalValue' in result && {
					temporalValue: result.temporalValue
				}),
				dottedName: result.dottedName
			} as EvaluatedRule<Names>
		}
		if (options?.unit) {
			try {
				return convertNodeToUnit(
					parseUnit(options.unit),
					result as EvaluatedNode<Names, number>
				)
			} catch (e) {
				warning(
					`[evaluation] ${expression}`,
					"L'unité demandée est incompatible avec l'expression évaluée"
				)
			}
		}
		return result
	}

	getWarnings() {
		return this.warnings
	}

	inversionFail(): boolean {
		return !!this.cache._meta.inversionFail
	}

	getParsedRules(): ParsedRules<Names> {
		return this.parsedRules
	}
}
