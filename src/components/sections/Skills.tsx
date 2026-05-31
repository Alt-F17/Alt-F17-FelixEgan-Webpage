import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FaGitAlt, FaLanguage, FaPython, FaReact } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { useLanguage } from '@/i18n/LanguageProvider';
import { portfolioCopy } from '@/content/portfolioCopy';
import type { Locale } from '@/i18n/types';

type Skill = {
	name: string;
	icon: IconType;
	description: Record<Locale, string>;
};

const skills: Skill[] = [
	{
		name: 'React / Next.js',
		icon: FaReact,
		description: {
			en: 'Fast, SEO-friendly sites. The modern alternative to WordPress.',
			fr: "Sites rapides et optimisés pour le SEO. L'alternative moderne à WordPress.",
		},
	},
	{
		name: 'Tailwind CSS',
		icon: SiTailwindcss,
		description: {
			en: 'Clean, responsive design without a page builder.',
			fr: 'Design propre et responsive sans page builder.',
		},
	},
	{
		name: 'TypeScript',
		icon: SiTypescript,
		description: {
			en: 'Reliable, maintainable codebases for long-term projects.',
			fr: 'Bases de code fiables et maintenables pour les projets à long terme.',
		},
	},
	{
		name: 'Bilingual Development',
		icon: FaLanguage,
		description: {
			en: 'FR/EN sites with proper i18n routing. A rare edge in Montreal.',
			fr: 'Sites FR/EN avec routage i18n propre. Un avantage rare à Montréal.',
		},
	},
	{
		name: 'Next.js Delivery',
		icon: SiNextdotjs,
		description: {
			en: 'Production-ready routing, metadata, and performance patterns.',
			fr: 'Routage, métadonnées et performance prêts pour la production.',
		},
	},
	{
		name: 'Python & Git',
		icon: FaPython,
		description: {
			en: 'Automation, version control, and reliable developer workflows.',
			fr: 'Automatisation, contrôle de version et workflows développeur fiables.',
		},
	},
	{
		name: 'GitHub Collaboration',
		icon: FaGitAlt,
		description: {
			en: 'Clear reviews, branching, and project history for maintainable work.',
			fr: 'Revues claires, branches et historique de projet pour un travail maintenable.',
		},
	},
];

export const Skills = () => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const cardsRef = useRef<HTMLDivElement[]>([]);
	const { locale } = useLanguage();
	const copy = portfolioCopy.skills;

	const addToCardsRef = (el: HTMLDivElement) => {
		if (el && !cardsRef.current.includes(el)) {
			cardsRef.current.push(el);
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('animate-fade-in');
					}
				});
			},
			{ threshold: 0.1 }
		);

		cardsRef.current.forEach((card) => observer.observe(card));

		return () => {
			cardsRef.current.forEach((card) => observer.unobserve(card));
		};
	}, []);

	return (
		<section id="skills" className="section" ref={sectionRef}>
			<div className="container-padding max-w-5xl mx-auto">
				<h2 className="section-title">
					<span className="text-space-accent">/</span> {copy.title[locale]}
				</h2>
				<p className="section-subtitle">{copy.subtitle[locale]}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{skills.map((skill, index) => (
						<div
							key={skill.name}
							ref={addToCardsRef}
							className="opacity-0 transform translate-y-4 transition-all duration-700 group"
							style={{ transitionDelay: `${index * 100}ms` }}
						>
							<Card className="bg-space-darker border-space-accent/20 lg:border-4 overflow-hidden relative">
								<div className="skill-shimmer" />
								<CardContent className="p-6">
									<div className="flex items-center mb-2">
										<skill.icon className="w-6 h-6 text-space-accent mr-3" />
										<h3 className="text-lg font-medium">{skill.name}</h3>
									</div>
									<p className="text-sm text-space-text/60">{skill.description[locale]}</p>
								</CardContent>
							</Card>
						</div>
					))}
				</div>

				<div
					ref={addToCardsRef}
					className="mt-12 opacity-0 transform translate-y-4 transition-all duration-700"
					style={{ transitionDelay: `${skills.length * 100}ms` }}
				>
					<Card className="bg-space-darker border-space-accent/20 lg:border-4">
						<CardContent className="p-6">
							<h3 className="text-xl font-medium mb-4">
								{copy.focusTitle[locale]}
							</h3>
							<ul className="space-y-3 list-disc list-inside text-space-text/80">
								{copy.focusItems[locale].map((item, index) => (
									<li key={index}>{item}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default Skills;
