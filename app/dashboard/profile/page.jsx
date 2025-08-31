"use client";

import { useState } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  User,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Edit3,
  Save,
  X,
  Loader2,
  Camera,
  GraduationCap,
  Users,
  Phone,
  Calendar,
  Briefcase,
  BookOpen,
  Target,
  Clock,
  Twitter
} from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile, updateProfile } = useSupabase();
  const [isEditing, setIsEditing] = useState(() => {
    const r = (userProfile?.role || '').toLowerCase();
    if (r === 'student') {
      const missingStudentCore = !userProfile?.grade || !userProfile?.learning_style || !userProfile?.subjects_of_interest || (Array.isArray(userProfile?.subjects_of_interest) && userProfile.subjects_of_interest.length === 0);
      return missingStudentCore;
    }
    return false;
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Normalize role for robust comparisons
  const role = (userProfile?.role || '').toLowerCase();

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    bio: userProfile?.bio || '',
    phone: userProfile?.phone || '',
    country: userProfile?.country || '',
    city: userProfile?.city || '',
    timezone: userProfile?.timezone || '',
    language: userProfile?.language || 'en',
    website: userProfile?.website || '',
    linkedin_url: userProfile?.linkedin_url || '',
    github_url: userProfile?.github_url || '',
    twitter_url: userProfile?.twitter_url || '',

    // Student-specific fields
    grade: userProfile?.grade || '',
    school_name: userProfile?.school_name || '',
    date_of_birth: userProfile?.date_of_birth ? userProfile.date_of_birth.split('T')[0] : '',
    learning_goals: userProfile?.learning_goals || '',
    subjects_of_interest: userProfile?.subjects_of_interest || [],
    learning_style: userProfile?.learning_style || '',
    difficulty_preference: userProfile?.difficulty_preference || 'intermediate',

    // Parent-specific fields
    occupation: userProfile?.occupation || '',
    number_of_children: userProfile?.number_of_children || '',
    education_level: userProfile?.education_level || '',
    parenting_experience: userProfile?.parenting_experience || '',
    children_age_range: userProfile?.children_age_range || ''
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateUrl = (url) => {
    if (!url) return true; // URLs are optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validations
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.linkedin_url && !validateUrl(formData.linkedin_url)) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    if (formData.github_url && !validateUrl(formData.github_url)) {
      newErrors.github_url = 'Please enter a valid GitHub URL';
    }

    if (formData.twitter_url && !validateUrl(formData.twitter_url)) {
      newErrors.twitter_url = 'Please enter a valid Twitter URL';
    }

    // Student-specific validations
    if (role === 'student') {
      if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 5 || age > 100) {
          newErrors.date_of_birth = 'Please enter a valid date of birth';
        }
      }

      if (formData.school_name && formData.school_name.length > 100) {
        newErrors.school_name = 'School name must be less than 100 characters';
      }
    }

    // Parent-specific validations
    if (role === 'parent') {
      if (formData.number_of_children && (formData.number_of_children < 1 || formData.number_of_children > 20)) {
        newErrors.number_of_children = 'Please enter a valid number of children (1-20)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
    'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const grades = [
    'Elementary (K-5)', '6th Grade', '7th Grade', '8th Grade', '9th Grade (Freshman)',
    '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)',
    'College Freshman', 'College Sophomore', 'College Junior', 'College Senior',
    'Graduate Student', 'Adult Learner', 'Other'
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual (Learn by seeing)' },
    { value: 'auditory', label: 'Auditory (Learn by hearing)' },
    { value: 'kinesthetic', label: 'Kinesthetic (Learn by doing)' },
    { value: 'reading', label: 'Reading/Writing (Learn by reading and writing)' }
  ];

  const educationLevels = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree',
    'Doctoral Degree', 'Professional Degree', 'Trade/Vocational Training', 'Other'
  ];

  const parentingExperience = [
    { value: 'first-time', label: 'First-time Parent' },
    { value: 'experienced', label: 'Experienced Parent (2-5 years)' },
    { value: 'very-experienced', label: 'Very Experienced Parent (5+ years)' }
  ];

  const childrenAgeRanges = [
    '0-5 years', '6-10 years', '11-15 years', '16-18 years', 'Mixed ages'
  ];

  const subjectOptions = [
    'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry',
    'Physics', 'Chemistry', 'Biology', 'Earth Science', 'Environmental Science', 'Astronomy',
    'English Literature', 'Creative Writing', 'Grammar', 'Poetry', 'Public Speaking', 'Journalism',
    'World History', 'American History', 'European History', 'Ancient History', 'Political Science', 'Government',
    'Geography', 'Cultural Studies', 'Anthropology', 'Sociology', 'Psychology', 'Philosophy',
    'Computer Science', 'Programming', 'Web Development', 'Data Science', 'Artificial Intelligence', 'Cybersecurity',
    'Art', 'Drawing', 'Painting', 'Sculpture', 'Photography', 'Graphic Design', 'Digital Art',
    'Music', 'Piano', 'Guitar', 'Violin', 'Singing', 'Music Theory', 'Music Composition',
    'Physical Education', 'Sports', 'Fitness', 'Health', 'Nutrition', 'Yoga', 'Dance',
    'Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Arabic', 'Portuguese',
    'Economics', 'Business', 'Entrepreneurship', 'Accounting', 'Marketing', 'Finance',
    'Engineering', 'Robotics', 'Electronics', 'Mechanical Engineering', 'Civil Engineering',
    'Medicine', 'Nursing', 'Pharmacy', 'Veterinary Science', 'Dentistry',
    'Drama', 'Theater', 'Film Studies', 'Communications', 'Media Studies',
    'Cooking', 'Gardening', 'Woodworking', 'Fashion Design', 'Interior Design',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert subjects_of_interest array to proper format if needed
      const updatedData = {
        ...formData,
        number_of_children: formData.number_of_children ? parseInt(formData.number_of_children) : null,
        subjects_of_interest: Array.isArray(formData.subjects_of_interest)
          ? formData.subjects_of_interest
          : formData.subjects_of_interest ? [formData.subjects_of_interest] : []
      };

      const { error } = await updateProfile(updatedData);
      if (error) throw error;

      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      bio: userProfile?.bio || '',
      phone: userProfile?.phone || '',
      country: userProfile?.country || '',
      city: userProfile?.city || '',
      timezone: userProfile?.timezone || '',
      language: userProfile?.language || 'en',
      website: userProfile?.website || '',
      linkedin_url: userProfile?.linkedin_url || '',
      github_url: userProfile?.github_url || '',
      twitter_url: userProfile?.twitter_url || '',

      // Student-specific fields
      grade: userProfile?.grade || '',
      school_name: userProfile?.school_name || '',
      date_of_birth: userProfile?.date_of_birth ? userProfile.date_of_birth.split('T')[0] : '',
      learning_goals: userProfile?.learning_goals || '',
      subjects_of_interest: userProfile?.subjects_of_interest || [],
      learning_style: userProfile?.learning_style || '',
      difficulty_preference: userProfile?.difficulty_preference || 'intermediate',

      // Parent-specific fields
      occupation: userProfile?.occupation || '',
      number_of_children: userProfile?.number_of_children || '',
      education_level: userProfile?.education_level || '',
      parenting_experience: userProfile?.parenting_experience || '',
      children_age_range: userProfile?.children_age_range || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = Array.isArray(formData.subjects_of_interest)
      ? formData.subjects_of_interest
      : [];

    if (currentSubjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects_of_interest: currentSubjects.filter(s => s !== subject)
      });
    } else {
      setFormData({
        ...formData,
        subjects_of_interest: [...currentSubjects, subject]
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'instructor':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <Image
                    src={userProfile.avatar_url}
                    alt={userProfile.name || 'User avatar'}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userProfile?.name || 'User'}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleColor(userProfile?.role)}>
                    {userProfile?.role || 'student'}
                  </Badge>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {!isEditing && userProfile?.bio && (
                <p className="text-gray-700 mt-3">{userProfile.bio}</p>
              )}

              {!isEditing && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  {userProfile?.country && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userProfile.city ? `${userProfile.city}, ${userProfile.country}` : userProfile.country}
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {userProfile.phone}
                    </div>
                  )}
                  {role === 'student' && userProfile?.grade && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      {userProfile.grade}
                    </div>
                  )}
                  {role === 'parent' && userProfile?.occupation && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {userProfile.occupation}
                    </div>
                  )}
                  {userProfile?.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {userProfile?.linkedin_url && (
                    <div className="flex items-center">
                      <Linkedin className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {userProfile?.github_url && (
                    <div className="flex items-center">
                      <Github className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub
                      </a>
                    </div>
                  )}
                  {userProfile?.twitter_url && (
                    <div className="flex items-center">
                      <Twitter className="w-4 h-4 mr-1" />
                      <a
                        href={userProfile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Twitter
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter your city"
                    />
                  </div>
                </div>
              </div>

              {/* Student-specific fields */}
              {role === 'student' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Student Information
                  </h3>

                  {/* Basic Academic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Grade Level</label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">School Name</label>
                      <Input
                        value={formData.school_name}
                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        placeholder="Enter your school name"
                        className={errors.school_name ? "border-red-500" : ""}
                      />
                      {errors.school_name && <p className="text-red-500 text-sm mt-1">{errors.school_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className={errors.date_of_birth ? "border-red-500" : ""}
                      />
                      {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Learning Style</label>
                      <Select value={formData.learning_style} onValueChange={(value) => setFormData({ ...formData, learning_style: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your learning style" />
                        </SelectTrigger>
                        <SelectContent>
                          {learningStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Difficulty Preference</label>
                      <Select value={formData.difficulty_preference} onValueChange={(value) => setFormData({ ...formData, difficulty_preference: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Learning Goals</label>
                    <Textarea
                      value={formData.learning_goals}
                      onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                      placeholder="What do you want to achieve with your learning?"
                      rows={3}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.learning_goals.length}/1000 characters</p>
                  </div>

                  {/* Subjects of Interest */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Subjects of Interest</label>
                    <p className="text-sm text-gray-600 mb-3">Select all subjects that interest you (you can select multiple)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                      {subjectOptions.map((subject) => (
                        <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={Array.isArray(formData.subjects_of_interest) && formData.subjects_of_interest.includes(subject)}
                            onChange={() => handleSubjectToggle(subject)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {Array.isArray(formData.subjects_of_interest) ? formData.subjects_of_interest.length : 0} subjects
                    </p>
                  </div>
                </div>
              )}

              {/* Parent-specific fields */}
              {role === 'parent' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Parent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Occupation</label>
                      <Input
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Your profession or job title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Education Level</label>
                      <Select value={formData.education_level} onValueChange={(value) => setFormData({ ...formData, education_level: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Children</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.number_of_children}
                        onChange={(e) => setFormData({ ...formData, number_of_children: e.target.value })}
                        placeholder="How many children do you have?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Children&apos;s Age Range</label>
                      <Select value={formData.children_age_range} onValueChange={(value) => setFormData({ ...formData, children_age_range: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {childrenAgeRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Parenting Experience</label>
                      <Select value={formData.parenting_experience} onValueChange={(value) => setFormData({ ...formData, parenting_experience: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your parenting experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentingExperience.map((exp) => (
                            <SelectItem key={exp.value} value={exp.value}>
                              {exp.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-medium mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className={errors.website ? "border-red-500" : ""}
                    />
                    {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className={errors.linkedin_url ? "border-red-500" : ""}
                    />
                    {errors.linkedin_url && <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub URL</label>
                    <Input
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/username"
                      className={errors.github_url ? "border-red-500" : ""}
                    />
                    {errors.github_url && <p className="text-red-500 text-sm mt-1">{errors.github_url}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter URL</label>
                    <Input
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      placeholder="https://twitter.com/username"
                      className={errors.twitter_url ? "border-red-500" : ""}
                    />
                    {errors.twitter_url && <p className="text-red-500 text-sm mt-1">{errors.twitter_url}</p>}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion & Additional Info */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const requiredFields = role === 'student'
                  ? ['name', 'country', 'grade', 'learning_goals', 'subjects_of_interest', 'learning_style']
                  : ['name', 'country', 'occupation', 'number_of_children'];

                const completedFields = requiredFields.filter(field => {
                  const value = userProfile?.[field];
                  if (Array.isArray(value)) {
                    return value.length > 0;
                  }
                  return value && value.toString().trim().length > 0;
                }).length;

                const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profile Completion</span>
                      <span className="text-sm font-medium">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    {completionPercentage < 100 && (
                      <div className="text-sm text-gray-600">
                        Complete your profile to get better course recommendations and personalized learning experiences
                      </div>
                    )}
                    {userProfile?.role === 'student' && completionPercentage >= 80 && (
                      <div className="text-sm text-green-600 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Great progress! Your detailed profile helps us create better learning experiences for you.
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {role === 'student' ? (
                  <>
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Learning Profile
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Family Information
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile?.role === 'student' ? (
                <div className="space-y-3">
                  {userProfile?.learning_style && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Style</span>
                      <span className="font-medium capitalize">{userProfile.learning_style}</span>
                    </div>
                  )}
                  {userProfile?.difficulty_preference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty Level</span>
                      <span className="font-medium capitalize">{userProfile.difficulty_preference}</span>
                    </div>
                  )}
                  {userProfile?.school_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">School</span>
                      <span className="font-medium">{userProfile.school_name}</span>
                    </div>
                  )}
                  {userProfile?.grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade</span>
                      <span className="font-medium">{userProfile.grade}</span>
                    </div>
                  )}
                  {userProfile?.subjects_of_interest && userProfile.subjects_of_interest.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Interests</span>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.subjects_of_interest.slice(0, 4).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {userProfile.subjects_of_interest.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{userProfile.subjects_of_interest.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {userProfile?.number_of_children && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Children</span>
                      <span className="font-medium">{userProfile.number_of_children}</span>
                    </div>
                  )}
                  {userProfile?.children_age_range && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Children&apos;s Age Range</span>
                      <span className="font-medium">{userProfile.children_age_range}</span>
                    </div>
                  )}
                  {userProfile?.parenting_experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium capitalize">{userProfile.parenting_experience.replace('-', ' ')}</span>
                    </div>
                  )}
                  {userProfile?.education_level && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education</span>
                      <span className="font-medium">{userProfile.education_level}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Email Verified</span>
              <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                {user?.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Language</span>
              <span className="font-medium capitalize">
                {userProfile?.language === 'en' ? 'English' : userProfile?.language || 'English'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">User Role</span>
              <Badge className={getRoleColor(userProfile?.role)}>
                {role || 'student'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">
                {userProfile?.updated_at
                  ? new Date(userProfile.updated_at).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
