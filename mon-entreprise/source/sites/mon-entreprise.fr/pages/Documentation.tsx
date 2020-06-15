import { goBackToSimulation } from 'Actions/actions'
import SearchButton from 'Components/SearchButton'
import * as Animate from 'Components/ui/animate'
import { EngineContext } from 'Components/utils/EngineContext'
import { ScrollToTop } from 'Components/utils/Scroll'
import { SitePathsContext } from 'Components/utils/SitePathsContext'
import { Documentation, getDocumentationSiteMap } from 'publicodes'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useLocation, Link } from 'react-router-dom'
import { RootState } from 'Reducers/rootReducer'
import emoji from 'react-easy-emoji'
import couvertureLegislative from '../../../rules/couverture-legislative.yaml'
import styled from 'styled-components'
import animate from 'Components/ui/animate'

export default function RulePage() {
	const currentSimulation = useSelector(
		(state: RootState) => !!state.simulation?.url
	)
	const engine = useContext(EngineContext)
	const documentationPath = useContext(SitePathsContext).documentation.index
	const { pathname } = useLocation()
	const documentationSitePaths = useMemo(
		() => getDocumentationSiteMap({ engine, documentationPath }),
		[engine, documentationPath]
	)
	const { i18n } = useTranslation()

	if (pathname === '/documentation') {
		return <DocumentationLanding />
	}
	if (!documentationSitePaths[pathname]) {
		return <Redirect to="/404" />
	}
	return (
		<Animate.fromBottom>
			<ScrollToTop key={pathname} />
			<div
				css={`
					display: flex;
					margin-top: 2rem;
					justify-content: space-between;
				`}
			>
				{currentSimulation ? <BackToSimulation /> : <span />}
				<SearchButton key={pathname} />
			</div>
			<Documentation
				language={i18n.language as 'fr' | 'en'}
				engine={engine}
				documentationPath={documentationPath}
			/>
			{/* <button>Voir l</button> */}
		</Animate.fromBottom>
	)
}
function BackToSimulation() {
	const dispatch = useDispatch()
	const handleClick = useCallback(() => {
		dispatch(goBackToSimulation())
	}, [])
	return (
		<button
			className="ui__ simple small push-left button"
			onClick={handleClick}
		>
			← <Trans i18nKey="back">Reprendre la simulation</Trans>
		</button>
	)
}

function DocumentationLanding() {
	const sitePaths = useContext(SitePathsContext)
	const { pathname } = useLocation()
	const [currentlyOpenAccordeon, setCurrentlyOpenAccordeon] = useState()
	return (
		<>
			<ScrollToTop key={pathname} />
			<h1>
				<Trans i18nKey="page.documentation.title">
					Couverture législative <>{emoji('⚖')}</>
				</Trans>
			</h1>
			<p>
				Cette page référence les dispositifs existants dans la législation
				française en matière de droit de la sécurité sociale, droit fiscal, et
				plus partiellement en droit du travail. Cette liste n'est pas exhaustive
				mais permet d'avoir un aperçu synthétique des sujets couverts et de ceux
				non couverts par{' '}
				<Link to={sitePaths.simulateurs.index}>nos simulateurs</Link>.
			</p>
			<div className="ui__ card light-border">
				{couvertureLegislative.catégories.map(({ nom, icône, contenu }) => {
					const isOpen = currentlyOpenAccordeon === nom
					return (
						<CategorySection key={nom} className={isOpen ? 'isOpen' : ''}>
							<h3
								onClick={() => setCurrentlyOpenAccordeon(isOpen ? null : nom)}
							>
								{emoji(icône)} {nom}
							</h3>
							{isOpen && (
								<animate.fromTop>
									<ul>
										{contenu?.map(line => (
											<li key={line}>{line}</li>
										))}
									</ul>
								</animate.fromTop>
							)}
						</CategorySection>
					)
				})}
			</div>
		</>
	)
}

const CategorySection = styled.div`
	border-top: 2px solid var(--lighterColor);

	&:first-child {
		border-top: none;
	}

	h3 {
		cursor: pointer;
	}

	h3:after {
		display: block;
		content: '↓';
		float: right;
		transition: transform 0.4s ease-in-out;
	}

	&.isOpen h3:after {
		transform: rotate(180deg);
	}
`
