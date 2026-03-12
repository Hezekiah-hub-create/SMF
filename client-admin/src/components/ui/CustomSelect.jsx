import React, { useState, useEffect, useRef } from 'react'

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  searchable = false,
  clearable = false,
  disabled = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = searchable && search
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => {
          const input = wrapperRef.current?.querySelector('.custom-select-search')
          input?.focus()
        }, 50)
      }
    }
  }

  return (
    <div 
      className="custom-select-wrapper" 
      ref={wrapperRef}
      style={{ position: 'relative', ...style }}
    >
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <span className={`custom-select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="custom-select-actions">
          {clearable && value && (
            <span 
              className="custom-select-clear" 
              onClick={handleClear}
              role="button"
              tabIndex={-1}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="custom-select-overlay" />
          <div className="custom-select-dropdown">
            {searchable && (
              <div className="custom-select-search-wrapper">
                <input
                  type="text"
                  className="custom-select-search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <svg className="custom-select-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            )}
            <div className="custom-select-options">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`custom-select-option ${value === option.value ? 'active' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {value === option.value && (
                      <svg className="custom-select-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="custom-select-empty">
                  {searchable ? 'No results found' : 'No options available'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CustomSelect
