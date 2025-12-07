export interface Socials {
  email: string;
  linkedin: string;
  github: string;
}

export interface GeneralData {
  name: string;
  headline: string;
  about: string[];
  socials: Socials;
  navigation: {
    about: string;
    skills: string;
    experiences: string;
    education: string;
    projects: string;
    contact: string;
  };
  buttons: {
    getInTouch: string;
    github: string;
    linkedin: string;
    discoverWork: string;
    viewProjects: string;
    emailMe?: string;
  };
  sections: {
    about: string;
    skills: string;
    experiences: string;
    education: string;
    projects: string;
    contact: string;
  };
  greeting: {
    hello: string;
  };
}

export interface Skills {
  backend: string[];
  frontend: string[];
  devops: string[];
  web3?: string[];
}

export interface ExperienceSummary {
  title: string;
  bullets: string[];
}

export interface CTA {
  title: string;
  subtitle: string;
  buttonText: string;
  email: string;
}

export interface Experience {
  title: string;
  company: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
  logo: string;
  skills: string[];
}

export interface Education {
  subject: string;
  degree: string;
  university: string;
  href: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  framework: string;
  description: string;
  href: string;
  stars: string;
}

export interface Translations {
  general: GeneralData;
  skills: Skills;
  experienceSummary: ExperienceSummary;
  cta: CTA;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}
