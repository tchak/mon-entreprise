import React from 'react'
import { InfixMecanism } from '../components/mecanisms/common'
import { typeWarning } from '../error'
import { evaluateNode, makeJsx, mergeMissing } from '../evaluation'
import { convertNodeToUnit } from '../nodeUnits'

function MecanismPlancher({ explanation }) {
	return (
		<InfixMecanism value={explanation.valeur}>
			<p
				style={
					explanation.plancher.isActive
						? { background: 'var(--lighterColor)', fontWeight: 'bold' }
						: {}
				}
			>
				<strong>Plafonné à : </strong>
				{makeJsx(explanation.plancher)}
			</p>
		</InfixMecanism>
	)
}

const evaluate = (cache, situation, parsedRules, node) => {
	const evaluateAttribute = evaluateNode.bind(
		null,
		cache,
		situation,
		parsedRules
	)
	const valeur = evaluateAttribute(node.explanation.valeur)
	let nodeValue = valeur.nodeValue
	let plancher = node.explanation.plancher
	if (nodeValue !== false) {
		plancher = evaluateAttribute(plancher)
		if (valeur.unit) {
			try {
				plancher = convertNodeToUnit(valeur.unit, plancher)
			} catch (e) {
				typeWarning(
					cache._meta.contextRule,
					"L'unité du plancher n'est pas compatible avec celle de la valeur à encadrer",
					e
				)
			}
		}
	}
	if (
		typeof nodeValue === 'number' &&
		typeof plancher.nodeValue === 'number' &&
		nodeValue < plancher.nodeValue
	) {
		nodeValue = plancher.nodeValue
		plancher.isActive = true
	}
	return {
		nodeValue,
		explanation: { valeur, plancher },
		missingVariables: mergeMissing(valeur, plancher)
	}
}

export default function Plancher(recurse, v) {
	const explanation = {
		valeur: recurse(v.valeur),
		plancher: recurse(v.plancher)
	}
	return {
		evaluate,
		jsx: MecanismPlancher,
		explanation,
		category: 'mecanism',
		name: 'plancher',
		type: 'numeric',
		unit: explanation.valeur.unit
	}
}

Plancher.nom = 'plancher'