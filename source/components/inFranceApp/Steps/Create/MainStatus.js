/* @flow */
import { map, whereEq } from 'ramda'
import React from 'react'
import { connect } from 'react-redux'
import * as Animate from '../../animate'
import { SkipButton } from '../../ui/Button'
import type { RouterHistory } from 'react-router'
import type { State as CompanySituation } from '../../types'
const setMainStatus = () => {}
const LEGAL_STATUS_DETAILS: { [status: string]: CompanySituation } = {
	EI: {
		legalSetup: 'SOLE_PROPRIETORSHIP',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: false
	},
	EURL: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: false
	},
	EIRL: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: false
	},
	SARL: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: true
	},
	SAS: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SALARIED',
		multipleAssociate: true
	},
	SA: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SALARIED',
		multipleAssociate: true
	},
	SNC: {
		legalSetup: 'SOLE_PROPRIETORSHIP',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: true
	},
	SASU: {
		legalSetup: 'LIMITED_LIABILITY',
		directorStatus: 'SELF_EMPLOYED',
		multipleAssociate: false
	}
}

type LegalStatus = $Keys<typeof LEGAL_STATUS_DETAILS>
const possibleStatusSelector = state =>
	map(whereEq(state.inFranceApp), LEGAL_STATUS_DETAILS)

type Props = {
	history: RouterHistory,
	possibleStatus: LegalStatus,
	setMainStatus: LegalStatus => void
}

const goToNextStep = (history: RouterHistory) => {
	history.push('/create-my-company/declare-my-business')
}

const StatusButton = ({
	status,
	history
}: {
	status: LegalStatus,
	history: RouterHistory
}) => (
	<button
		onClick={() => {
			goToNextStep(history)
		}}
		className="ui__ button">
		Create {status}
	</button>
)

const SetMainStatus = ({ history, possibleStatus }: Props) => (
	<Animate.fromBottom>
		<h2>Choose the legal status</h2>
		<p>To carry out your activity, you must choose a legal status.</p>
		<p>
			The choice of a legal form of practice depends on several factors: the way
			you wish to practice (alone or in a company), the possibility to separate
			personal and professional wealth, the tax status linked to the envisaged
			legal framework...
		</p>
		<p>
			This choice is important because it conditions your social protection. The
			company regime of the executive depends on the legal structure chosen and
			his function within it.
		</p>
		<p>
			Based on your previous answers, we narrowed it down for you to the
			following possibilities:
		</p>
		<ul>
			{possibleStatus.EI && (
				<li>
					<strong>EI - Entreprise individuelle (Individual business): </strong>
					Also called company in own name or company in a personal name. No
					capital contribution is necessary. Private wealth and corporate wealth
					are one.
				</li>
			)}
			{possibleStatus.EIRL && (
				<li>
					<strong>
						EIRL - Entrepreneur individuel à responsabilité limitée (Individual
						entrepreneur with limited liability)
					</strong>
					Protects your property by assigning to your business a professional
					heritage necessary for the activity.
				</li>
			)}
			{possibleStatus.EURL && (
				<li>
					<strong>
						EURL - Entreprise unipersonnelle à responsabilité limitée (Limited
						personal company):{' '}
					</strong>
					Company with only one partner. Liability is limited to the amount of
					its contribution to the capital.
				</li>
			)}
			{possibleStatus.SARL && (
				<li>
					<strong>
						SARL - Société à responsabilité limitée (Limited corporation):{' '}
					</strong>
					Composed of at least 2 partners whose financial responsibility is
					limited to the amounts of contributions in the capital. The minimum
					capital is freely fixed in the statutes.
				</li>
			)}
			{possibleStatus.SAS && (
				<li>
					<strong>
						SAS - Société par action simplifiée (Simplified joint stock
						company):{' '}
					</strong>Composed of at least 2 associates. The financial
					responsibility of the partners is limited to the amounts of
					contributions in the capital. The minimum capital is freely fixed in
					the statutes.
				</li>
			)}
			{possibleStatus.SASU && (
				<li>
					<strong>
						SASU - Société par action simplifiée unitaire (Simplified personal
						joint stock company):{' '}
					</strong>Composed of only one associate. The financial responsibility
					is limited to the amounts of contributions in the capital. The minimum
					capital is freely fixed in the statutes.
				</li>
			)}
			{possibleStatus.SA && (
				<li>
					<strong>SASU - Société anonyme (Anonymous company):</strong>Company
					composed of at least 2 shareholders if it is not listed.
				</li>
			)}
			{possibleStatus.SNC && (
				<li>
					<strong>SNC - Société en nom collectif (Partnership):</strong>The
					partners are liable indefinitely and severally for the debts of the
					company.
				</li>
			)}
		</ul>
		<div className="ui__ answer-group">
			{/* $FlowFixMe */}
			{(Object.entries(possibleStatus): Array<[LegalStatus, boolean]>)
				.filter(([, statusIsVisible]) => statusIsVisible)
				.map(([status]) => (
					<StatusButton key={status} status={status} history={history} />
				))}
			<SkipButton onClick={() => goToNextStep(history)}>Do it later</SkipButton>
		</div>
	</Animate.fromBottom>
)

export default connect(
	state => ({ possibleStatus: possibleStatusSelector(state) }),
	{ setMainStatus }
)(SetMainStatus)