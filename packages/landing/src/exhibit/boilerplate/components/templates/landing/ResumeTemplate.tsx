'use client';

import type { FC, ReactNode } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiArrowDown,
  FiBriefcase,
  FiBook,
  FiCpu,
  FiDownload,
  FiExternalLink,
  FiFolder,
  FiGlobe,
  FiMail,
  FiMapPin,
} from 'react-icons/fi';

interface ResumeProfile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  location: string;
  website: string;
  summary: string;
}

interface ResumeExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

interface ResumeProjectItem {
  name: string;
  description: string;
  tech: string[];
  url?: string;
}

interface ResumeEducationItem {
  degree: string;
  school: string;
  period: string;
  details: string;
}

interface ResumeSkillGroup {
  label: string;
  skills: string[];
}

interface ResumeTemplateProps {
  profile: ResumeProfile;
  experiences: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  skills: ResumeSkillGroup[];
}

const SectionHeading: FC<{
  icon: ReactNode;
  title: string;
  eyebrow: string;
}> = ({ icon, title, eyebrow }) => (
  <div className="mb-8 flex items-center gap-4">
    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-primary text-xs tracking-[0.2em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-xl">{title}</h2>
    </div>
  </div>
);

const ExperienceSection: FC<{ experiences: ResumeExperienceItem[] }> = ({
  experiences,
}) => (
  <section id="experience" className="mx-auto w-full max-w-5xl px-6 py-16">
    <SectionHeading
      icon={<FiBriefcase className="h-5 w-5" />}
      title="Work experience"
      eyebrow="Experience"
    />
    <div className="flex flex-col gap-6">
      {experiences.map((exp) => (
        <article
          key={`${exp.role}-${exp.company}`}
          className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-medium">{exp.role}</h3>
              <p className="text-primary mt-0.5 text-sm">{exp.company}</p>
            </div>
            <span className="badge badge-ghost badge-sm rounded-full">
              {exp.period}
            </span>
          </div>
          <p className="text-base-content/60 mb-4 text-sm leading-relaxed">
            {exp.description}
          </p>
          <ul className="flex flex-col gap-2">
            {exp.highlights.map((highlight) => (
              <li key={highlight} className="text-base-content/60 text-sm">
                <span className="text-primary mr-2">&rsaquo;</span>
                {highlight}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </section>
);

const ProjectSection: FC<{ projects: ResumeProjectItem[] }> = ({
  projects,
}) => (
  <section
    id="projects"
    className="bg-base-200 border-base-content/10 border-y py-16">
    <div className="mx-auto w-full max-w-5xl px-6">
      <SectionHeading
        icon={<FiFolder className="h-5 w-5" />}
        title="Selected projects"
        eyebrow="Projects"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.name}
            className="border-base-content/10 bg-base-100 hover:border-primary/50 flex flex-col rounded-2xl border p-6 transition-colors">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 className="text-base font-medium">{project.name}</h3>
              {project.url && (
                <Link
                  href={project.url}
                  className="text-base-content/40 hover:text-primary transition-colors"
                  aria-label={`Open ${project.name}`}>
                  <FiExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
            <p className="text-base-content/60 mb-4 text-sm leading-relaxed">
              {project.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="badge badge-ghost badge-sm">
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const SkillSection: FC<{ skills: ResumeSkillGroup[] }> = ({ skills }) => (
  <section id="skills" className="mx-auto w-full max-w-5xl px-6 py-16">
    <SectionHeading
      icon={<FiCpu className="h-5 w-5" />}
      title="Skills &amp; tools"
      eyebrow="Skills"
    />
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {skills.map((group) => (
        <div
          key={group.label}
          className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
          <p className="mb-4 text-sm font-medium">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <span key={skill} className="badge badge-outline badge-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const EducationSection: FC<{ education: ResumeEducationItem[] }> = ({
  education,
}) => (
  <section
    id="education"
    className="bg-base-200 border-base-content/10 border-y py-16">
    <div className="mx-auto w-full max-w-5xl px-6">
      <SectionHeading
        icon={<FiBook className="h-5 w-5" />}
        title="Education"
        eyebrow="Education"
      />
      <div className="flex flex-col gap-6">
        {education.map((item) => (
          <article
            key={`${item.degree}-${item.school}`}
            className="border-base-content/10 bg-base-100 rounded-2xl border p-6">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-medium">{item.degree}</h3>
                <p className="text-base-content/50 mt-0.5 text-sm">
                  {item.school}
                </p>
              </div>
              <span className="badge badge-ghost badge-sm rounded-full">
                {item.period}
              </span>
            </div>
            <p className="text-base-content/60 text-sm leading-relaxed">
              {item.details}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const ResumeTemplate: FC<ResumeTemplateProps> = ({
  profile,
  experiences,
  projects,
  education,
  skills,
}) => (
  <div className="flex min-h-dvh flex-col">
    <main className="flex-1">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center">
        <span className="badge badge-neutral mb-6 rounded-full">
          {profile.title}
        </span>
        <h1 className="mb-4 text-5xl md:text-6xl">{profile.name}</h1>
        <p className="text-base-content/50 mb-8 max-w-2xl text-sm leading-relaxed">
          {profile.tagline}
        </p>
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="border-base-content/20 text-base-content/50 flex items-center gap-2 rounded-full border px-4 py-2">
            <FiMapPin className="h-3.5 w-3.5" />
            {profile.location}
          </span>
          <Link
            href={`mailto:${profile.email}`}
            className="border-base-content/20 text-base-content/50 hover:border-primary/50 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-colors">
            <FiMail className="h-3.5 w-3.5" />
            {profile.email}
          </Link>
          <Link
            href={profile.website}
            className="border-base-content/20 text-base-content/50 hover:border-primary/50 hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-colors">
            <FiGlobe className="h-3.5 w-3.5" />
            {profile.website}
          </Link>
        </div>
        <p className="text-base-content/60 mb-12 max-w-3xl text-sm leading-relaxed">
          {profile.summary}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#experience" className="btn btn-primary">
            View experience <FiArrowDown className="h-4 w-4" />
          </a>
          <button className="btn btn-ghost">
            <FiDownload className="h-4 w-4" />
            Download resume
          </button>
        </div>
      </section>

      <ExperienceSection experiences={experiences} />
      <ProjectSection projects={projects} />
      <SkillSection skills={skills} />
      <EducationSection education={education} />
    </main>

    <footer className="border-base-300 border-t px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-base-content/50 text-xs">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href={`mailto:${profile.email}`}
            className="text-base-content/50 hover:text-base-content text-xs transition-colors">
            Email
          </Link>
          <Link
            href={profile.website}
            className="text-base-content/50 hover:text-base-content text-xs transition-colors">
            Website
          </Link>
        </div>
      </div>
    </footer>
  </div>
);

ResumeTemplate.displayName = 'ResumeTemplate';
