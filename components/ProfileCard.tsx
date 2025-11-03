'use client';

import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, MapPin, Building2, Award, Link as LinkIcon, TrendingUp, BookOpen, Globe, FileText, Users as UsersIcon, Star } from 'lucide-react';

interface ProfileCardProps {
  profile: any;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  // Helper to safely extract text from nested objects
  const getText = (item: any): string => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      return item.title || item.name || item.text || item.section_name || JSON.stringify(item);
    }
    return String(item || '');
  };

  // Helper to safely extract arrays from nested structures
  const getArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data.section_components) {
      return Array.isArray(data.section_components) ? data.section_components : [];
    }
    return [];
  };

  // Merge data from both profile and rawProfile
  const rawProfile = profile.rawProfile || {};
  
  // Get all data with fallbacks and safe extraction
  const experiences = getArray(profile.experiences || rawProfile.experiences);
  const educations = getArray(profile.educations || rawProfile.educations);
  const skills = getArray(profile.skills || rawProfile.skills);
  const updates = getArray(profile.updates || rawProfile.updates);
  const honorsAndAwards = getArray(profile.honorsAndAwards || rawProfile.honorsAndAwards);
  const courses = getArray(profile.courses || rawProfile.courses);
  const projects = getArray(profile.projects || rawProfile.projects);
  const languages = getArray(profile.languages || rawProfile.languages);
  const publications = getArray(profile.publications || rawProfile.publications);
  const organizations = getArray(profile.organizations || rawProfile.organizations);
  const certifications = getArray(profile.licenseAndCertificates || rawProfile.licenseAndCertificates);
  const volunteer = getArray(profile.volunteerAndAwards || rawProfile.volunteerAndAwards);
  const interests = getArray(profile.interests || rawProfile.interests);
  const recommendations = getArray(profile.recommendations || rawProfile.recommendations);
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-zinc-900/30 to-black border border-zinc-800/50 rounded-xl backdrop-blur-sm">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800/50 p-6">
        <div className="flex items-start gap-5">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {profile.profilePicHighQuality || profile.profilePic ? (
              <img
                src={profile.profilePicHighQuality || profile.profilePic}
                alt={profile.fullName}
                className="w-24 h-24 rounded-xl object-cover border-2 border-zinc-700 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                <span className="text-3xl text-zinc-600">?</span>
              </div>
            )}
          </div>
          
          {/* Header Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1.5">{profile.fullName}</h1>
            {profile.headline && (
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{profile.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
              {profile.addressWithCountry && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.addressWithCountry}</span>
                </div>
              )}
              {profile.connections && (
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" />
                  {profile.connections} connections
                </span>
              )}
              {profile.followers && <span>{profile.followers} followers</span>}
            </div>
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 w-fit hover:underline transition-colors"
              >
                <LinkIcon className="w-3 h-3" /> View LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* About */}
        {profile.about && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">About</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed pl-6">{profile.about}</p>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Experience</h2>
            </div>
            <div className="space-y-4 pl-6">
              {experiences.map((exp: any, idx: number) => (
                <div key={idx} className="flex gap-3 pb-4 border-b border-zinc-800/50 last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {exp.logo ? (
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden p-1 shadow-md">
                        <img
                          src={exp.logo}
                          alt={exp.companyName || 'Company'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-0.5">{getText(exp.title)}</h3>
                    <p className="text-gray-400 text-sm mb-1">{getText(exp.subtitle)}</p>
                    {exp.caption && (
                      <p className="text-xs text-gray-500 mb-1">{getText(exp.caption)}</p>
                    )}
                    {exp.metadata && (
                      <p className="text-xs text-gray-600">{getText(exp.metadata)}</p>
                    )}
                    {exp.subComponents?.[0]?.description?.[0]?.text && (
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        {getText(exp.subComponents[0].description[0].text)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Education</h2>
            </div>
            <div className="space-y-4 pl-6">
              {educations.map((edu: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {edu.logo ? (
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden p-1 shadow-md">
                        <img
                          src={edu.logo}
                          alt={edu.title || 'School'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-0.5">{getText(edu.title)}</h3>
                    {edu.subtitle && (
                      <p className="text-gray-400 text-sm mb-1">{getText(edu.subtitle)}</p>
                    )}
                    {edu.caption && (
                      <p className="text-xs text-gray-500">{getText(edu.caption)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-gray-300 hover:bg-zinc-800 transition-colors"
                >
                  {getText(skill)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        {updates.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="space-y-3 pl-6">
              {updates.slice(0, 3).map((update: any, idx: number) => (
                <div key={idx} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors">
                  {update.postLink ? (
                    <a 
                      href={update.postLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline"
                    >
                      {getText(update.title || "View Post")}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-300">{getText(update.title)}</p>
                  )}
                  {update.image && (
                    <img 
                      src={update.image} 
                      alt="Post" 
                      className="mt-2 max-h-40 w-full object-cover rounded-md" 
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Honors & Awards */}
        {honorsAndAwards.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Honors & Awards</h2>
            </div>
            <div className="space-y-2 pl-6">
              {honorsAndAwards.map((award: any, idx: number) => (
                <div key={idx} className="border-l-2 border-yellow-500/50 pl-3 py-2 hover:border-yellow-500 transition-colors">
                  <h3 className="font-semibold text-white text-sm">{getText(award.title || award)}</h3>
                  {award.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{getText(award.subtitle)}</p>
                  )}
                  {award.caption && (
                    <p className="text-xs text-gray-500 mt-0.5">{getText(award.caption)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Courses</h2>
            </div>
            <div className="space-y-2 pl-6">
              {courses.map((course: any, idx: number) => (
                <div key={idx}>
                  <p className="text-sm text-gray-300">{getText(course.title || course)}</p>
                  {course.subtitle && (
                    <p className="text-xs text-gray-500">{getText(course.subtitle)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Projects</h2>
            </div>
            <div className="space-y-2 pl-6">
              {projects.map((project: any, idx: number) => (
                <div key={idx} className="bg-zinc-800/20 rounded-lg p-3 border border-zinc-700/30">
                  <h3 className="font-semibold text-white text-sm">{getText(project.title || project)}</h3>
                  {project.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{getText(project.subtitle)}</p>
                  )}
                  {project.caption && (
                    <p className="text-xs text-gray-500 mt-1">{getText(project.caption)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {languages.map((lang: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-gray-300"
                >
                  {getText(lang)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Publications</h2>
            </div>
            <div className="space-y-2 pl-6">
              {publications.map((pub: any, idx: number) => (
                <div key={idx}>
                  <p className="text-sm text-gray-300 font-medium">{getText(pub.title || pub)}</p>
                  {pub.subtitle && (
                    <p className="text-xs text-gray-500">{getText(pub.subtitle)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Organizations */}
        {organizations.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Organizations</h2>
            </div>
            <div className="space-y-2 pl-6">
              {organizations.map((org: any, idx: number) => (
                <div key={idx}>
                  <p className="text-sm text-gray-300">{getText(org.title || org)}</p>
                  {org.subtitle && (
                    <p className="text-xs text-gray-500">{getText(org.subtitle)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Certifications</h2>
            </div>
            <div className="space-y-2 pl-6">
              {certifications.map((cert: any, idx: number) => (
                <div key={idx}>
                  <p className="text-sm text-gray-300">{getText(cert.title || cert)}</p>
                  {cert.subtitle && (
                    <p className="text-xs text-gray-500">{getText(cert.subtitle)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteer Work */}
        {volunteer.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Volunteer Experience</h2>
            </div>
            <div className="space-y-2 pl-6">
              {volunteer.map((vol: any, idx: number) => (
                <div key={idx}>
                  <p className="text-sm text-gray-300">{getText(vol.title || vol)}</p>
                  {vol.subtitle && (
                    <p className="text-xs text-gray-500">{getText(vol.subtitle)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Interests</h2>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {interests.map((interest: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-gray-300"
                >
                  {getText(interest)}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
