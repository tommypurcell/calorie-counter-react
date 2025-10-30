import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const toStringValue = (value) => (value === null || value === undefined ? '' : String(value))
const toNullableNumber = (value) => {
  if (value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const computeBMI = (heightCm, weightKg) => {
  const height = Number(heightCm)
  const weight = Number(weightKg)
  if (!height || !weight) return null
  const heightMeters = height / 100
  if (!heightMeters) return null
  const bmi = weight / (heightMeters * heightMeters)
  return Number.isNaN(bmi) ? null : Number(bmi.toFixed(1))
}

function InfoCard({ title, items, isEditing, fieldValues, handleChange }) {
  return (
    <section className="rounded-2xl border border-gray-100 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{title}</h3>
      <dl className="mt-4 space-y-3">
        {items.map(({ label, value, name, editable, inputType = 'text', inputProps, unit }) => {
          const showInput = Boolean(isEditing && editable && name)
          const inputValue = name ? fieldValues[name] ?? '' : ''
          return (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-gray-500">{label}</dt>
              <dd className="flex items-center">
                {showInput ? (
                  <>
                    <input
                      type={inputType}
                      name={name}
                      value={inputValue}
                      onChange={handleChange}
                      className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      {...inputProps}
                    />
                    {unit && <span className="ml-2 text-xs text-gray-500">{unit}</span>}
                  </>
                ) : (
                  <span className="font-medium text-gray-900">{value ?? '—'}</span>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [userId, setUserId] = useState(null)
  const [fieldValues, setFieldValues] = useState({
    avatar: '',
    name: '',
    email: '',
    calorieGoal: '',
    proteingoal: '',
    carbgoal: '',
    fatgoal: '',
    height_cm: '',
    weight_kg: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [changesSaved, setChangesSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(true)

  const syncFieldValues = (data) => {
    setFieldValues({
      avatar: toStringValue(data?.avatar),
      name: toStringValue(data?.name),
      email: toStringValue(data?.email),
      calorieGoal: toStringValue(data?.calorieGoal),
      proteingoal: toStringValue(data?.proteingoal),
      carbgoal: toStringValue(data?.carbgoal),
      fatgoal: toStringValue(data?.fatgoal),
      height_cm: toStringValue(data?.height_cm),
      weight_kg: toStringValue(data?.weight_kg)
    })
  }

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUserId(user.id)

      await supabase.from('profiles').upsert({ id: user.id, email: user.email || '' }, { onConflict: 'id' })

      const { data, error } = await supabase.from('profiles').select('avatar, name, email, calorieGoal, proteingoal, carbgoal, fatgoal, height_cm, weight_kg, bmi, bmr').eq('id', user.id).single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        setLoading(false)
        return
      }

      setProfile(data)
      syncFieldValues(data)

      if (data) {
        localStorage.setItem('avatar', data.avatar || '')
        localStorage.setItem('name', data.name || '')
        if (data.calorieGoal !== undefined && data.calorieGoal !== null) {
          localStorage.setItem('calorieGoal', String(data.calorieGoal))
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [navigate])

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${userId}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

    const publicUrl = publicUrlData?.publicUrl
    if (publicUrl) {
      setFieldValues((prev) => ({ ...prev, avatar: publicUrl }))
      setProfile((prev) => ({ ...prev, avatar: publicUrl }))
    }
  }

  const handleDeleteAccount = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').delete().eq('id', user.id)
    if (error) {
      console.error('❌ Error deleting profile:', error)
      return
    }
    await supabase.auth.signOut()
    navigate('/')
    console.log('✅ Profile deleted and signed out')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setChangesSaved(false)
    setFieldValues((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleCancelEdit = () => {
    syncFieldValues(profile || {})
    setIsEditing(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!userId) return

    const updatedProfile = {
      name: fieldValues.name.trim() || null,
      email: fieldValues.email.trim() || null,
      avatar: fieldValues.avatar.trim() || null,
      fatgoal: toNullableNumber(fieldValues.fatgoal),
      carbgoal: toNullableNumber(fieldValues.carbgoal),
      calorieGoal: toNullableNumber(fieldValues.calorieGoal),
      proteingoal: toNullableNumber(fieldValues.proteingoal),
      height_cm: toNullableNumber(fieldValues.height_cm),
      weight_kg: toNullableNumber(fieldValues.weight_kg)
    }

    const bmiValue = computeBMI(updatedProfile.height_cm, updatedProfile.weight_kg)
    updatedProfile.bmi = bmiValue

    const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error.message)
      return
    }

    const mergedProfile = { ...(profile || {}), ...updatedProfile }
    setProfile(mergedProfile)
    syncFieldValues(mergedProfile)
    setIsEditing(false)
    setChangesSaved(true)

    localStorage.setItem('avatar', updatedProfile.avatar || '')
    localStorage.setItem('name', updatedProfile.name || '')
    if (updatedProfile.calorieGoal !== null && updatedProfile.calorieGoal !== undefined) {
      localStorage.setItem('calorieGoal', String(updatedProfile.calorieGoal))
    } else {
      localStorage.removeItem('calorieGoal')
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">Loading profile...</div>
  }

  const displayName = fieldValues.name || profile?.name || ''
  const displayEmail = fieldValues.email || profile?.email || ''
  const displayAvatar = fieldValues.avatar || profile?.avatar

  const formatUnit = (value, unit) => {
    if (value === null || value === undefined || value === '') return null
    return `${value} ${unit}`
  }

  const previewValue = (name) => {
    if (isEditing && Object.prototype.hasOwnProperty.call(fieldValues, name)) {
      return fieldValues[name]
    }
    return toStringValue(profile?.[name])
  }

  const previewHeight = previewValue('height_cm')
  const previewWeight = previewValue('weight_kg')
  const previewBMI = computeBMI(previewHeight, previewWeight) ?? profile?.bmi ?? null

  const goalsInfo = [
    { label: 'Calories', name: 'calorieGoal', value: formatUnit(previewValue('calorieGoal'), 'kcal'), editable: true, inputType: 'number', inputProps: { step: '1' }, unit: 'kcal' },
    { label: 'Protein', name: 'proteingoal', value: formatUnit(previewValue('proteingoal'), 'g'), editable: true, inputType: 'number', inputProps: { step: '1' }, unit: 'g' },
    { label: 'Carbs', name: 'carbgoal', value: formatUnit(previewValue('carbgoal'), 'g'), editable: true, inputType: 'number', inputProps: { step: '1' }, unit: 'g' },
    { label: 'Fat', name: 'fatgoal', value: formatUnit(previewValue('fatgoal'), 'g'), editable: true, inputType: 'number', inputProps: { step: '1' }, unit: 'g' }
  ]

  const bodyInfo = [
    { label: 'Height', name: 'height_cm', value: formatUnit(previewHeight, 'cm'), editable: true, inputType: 'number', inputProps: { step: '0.1' }, unit: 'cm' },
    { label: 'Weight', name: 'weight_kg', value: formatUnit(previewWeight, 'kg'), editable: true, inputType: 'number', inputProps: { step: '0.1' }, unit: 'kg' },
    { label: 'BMI', value: previewBMI ? previewBMI : null },
    { label: 'BMR', value: formatUnit(profile?.bmr, 'kcal') }
  ]

  const viewSections = [
    { title: 'Goals', items: goalsInfo },
    { title: 'Body Data', items: bodyInfo }
  ]
  const deletePhrase = `Delete account for ${profile?.name || 'your profile'}`

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {changesSaved && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Profile updated.</div>}

        <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group h-40 w-40 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-50 transition">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Profile avatar" className="h-full w-full object-cover transition duration-300" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-gray-400">Avatar</div>
                )}

                {isEditing && (
                  <>
                    <label htmlFor="avatarUpload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 cursor-pointer">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md transition hover:bg-cyan-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </label>
                    <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={fieldValues.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">{displayName || 'Add your name'}</p>
                )}
                <p className="text-sm text-gray-500">{displayEmail || 'Add your email'}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              {isEditing ? (
                <>
                  <button type="button" onClick={handleCancelEdit} className="rounded-full border border-gray-200 px-4 py-1 text-gray-600 transition hover:border-gray-300 hover:text-gray-900">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-full bg-cyan-500 px-4 py-1 text-white transition hover:bg-cyan-400">
                    Save
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    syncFieldValues(profile || {})
                    setIsEditing(true)
                    setChangesSaved(false)
                  }}
                  className="rounded-full border border-gray-200 px-4 py-1 text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
            {viewSections.map((section) => (
              <InfoCard key={section.title} title={section.title} items={section.items} isEditing={isEditing} fieldValues={fieldValues} handleChange={handleChange} />
            ))}
          </div>
        </form>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setShowDelete(true)} className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            Delete Account
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-11/12 max-w-sm rounded-3xl border border-gray-100 bg-white p-6 text-gray-900 shadow-2xl">
            <h3 className="text-xl font-semibold text-red-600">Confirm Deletion</h3>
            <p className="mt-3 text-sm text-gray-600">
              Type <span className="font-semibold text-gray-900">"{deletePhrase}"</span> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/40"
              placeholder="Type here..."
            />
            <div className="mt-6 flex justify-end gap-3 text-sm font-semibold">
              <button onClick={() => setShowDelete(false)} className="rounded-full border border-gray-200 px-4 py-2 text-gray-600 transition hover:border-gray-300 hover:text-gray-900">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={confirmText !== deletePhrase} className={`rounded-full px-4 py-2 transition ${confirmText === deletePhrase ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-400'}`}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
