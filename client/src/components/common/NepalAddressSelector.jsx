import React, { useState, useEffect } from 'react';
import provinces from '../../data/address/provinces.json';
import districts from '../../data/address/districts.json';
import localLevels from '../../data/address/local_levels.json';
import localLevelTypes from '../../data/address/local_level_type.json';
import Select from '../ui/Select';
import Input from '../ui/Input';

const NepalAddressSelector = ({ value, onChange, disabled }) => {
    // value expected format:
    // {
    //   province: "Province Name",
    //   district: "District Name",
    //   municipality: "Municipality Name",
    //   wardNo: "Ward No",
    //   tole: "Tole Name",
    //   formatted: "Full Address String"
    // }

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    // Derived states
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

    // Find the currently selected municipality object to get max wards
    const selectedMunicipalityObj = availableMunicipalities.find(l =>
        // Simple heuristic: check if the saved full string starts with the raw name
        value?.municipality?.startsWith(l.name)
    );

    // Default to 35 if not found or no wards data (legacy data case)
    const maxWards = selectedMunicipalityObj?.wards || 35;

    // Helper to generate formatted address
    const generateFormatted = (updates) => {
        const merged = { ...value, ...updates };
        const components = [
            merged.tole,
            merged.wardNo ? `Ward No. ${merged.wardNo}` : '',
            merged.municipality,
            merged.district,
            merged.province
        ].filter(Boolean);
        return components.join(', ');
    };

    // Initialize IDs based on current value if present (for editing)
    useEffect(() => {
        if (value?.province && !selectedProvinceId) {
            const prov = provinces.find(p => p.name === value.province || p.nepali_name === value.province);
            if (prov) {
                setSelectedProvinceId(prov.province_id);
                setAvailableDistricts(districts.filter(d => d.province_id === prov.province_id));
            }
        }
        if (value?.district && !selectedDistrictId) {
            const dist = districts.find(d => d.name === value.district || d.nepali_name === value.district);
            if (dist) {
                setSelectedDistrictId(dist.district_id);
                setAvailableMunicipalities(localLevels.filter(l => l.district_id === dist.district_id));
            }
        }
    }, [value, selectedProvinceId, selectedDistrictId]);

    // Handle Province Change
    const handleProvinceChange = (e) => {
        const provinceId = parseInt(e.target.value);
        const province = provinces.find(p => p.province_id === provinceId);

        setSelectedProvinceId(provinceId);
        setAvailableDistricts(districts.filter(d => d.province_id === provinceId));

        // Reset downstream selections
        setSelectedDistrictId('');
        setAvailableMunicipalities([]);

        const updates = {
            province: province ? province.name : '',
            district: '',
            municipality: '',
            wardNo: '',
            tole: ''
        };

        onChange({ ...value, ...updates, formatted: generateFormatted(updates) });
    };

    // Handle District Change
    const handleDistrictChange = (e) => {
        const districtId = parseInt(e.target.value);
        const district = districts.find(d => d.district_id === districtId);

        setSelectedDistrictId(districtId);
        setAvailableMunicipalities(localLevels.filter(l => l.district_id === districtId));

        const updates = {
            district: district ? district.name : '',
            municipality: '',
            wardNo: '',
            tole: value.tole // preserve tole
        };

        onChange({ ...value, ...updates, formatted: generateFormatted(updates) });
    };

    // Handle Municipality Change
    const handleMunicipalityChange = (e) => {
        const munId = parseInt(e.target.value);
        const municipal = localLevels.find(l => l.municipality_id === munId);
        const type = localLevelTypes.find(t => t.local_level_type_id === municipal?.local_level_type_id);

        const fullName = municipal ? `${municipal.name} ${type ? type.name : ''}` : '';

        const updates = {
            municipality: fullName,
            wardNo: '' // Reset ward when municipality changes
        };

        onChange({ ...value, ...updates, formatted: generateFormatted(updates) });
    };

    // Handle Ward/Tole Change
    const handleFieldChange = (field, newVal) => {
        const updates = { [field]: newVal };
        onChange({ ...value, ...updates, formatted: generateFormatted(updates) });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Province */}
                <Select
                    label="Province"
                    value={selectedProvinceId}
                    onChange={handleProvinceChange}
                    disabled={disabled}
                >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                        <option key={province.province_id} value={province.province_id}>
                            {province.name} ({province.nepali_name})
                        </option>
                    ))}
                </Select>

                {/* District */}
                <Select
                    label="District"
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceId || disabled}
                >
                    <option value="">Select District</option>
                    {availableDistricts.map(district => (
                        <option key={district.district_id} value={district.district_id}>
                            {district.name} ({district.nepali_name})
                        </option>
                    ))}
                </Select>

                {/* Municipality */}
                <Select
                    label="Municipality"
                    value={localLevels.find(l => {
                        return value?.municipality?.startsWith(l.name);
                    })?.municipality_id || ''}
                    onChange={handleMunicipalityChange}
                    disabled={!selectedDistrictId || disabled}
                >
                    <option value="">Select Municipality</option>
                    {availableMunicipalities.map(mun => {
                        const type = localLevelTypes.find(t => t.local_level_type_id === mun.local_level_type_id);
                        return (
                            <option key={mun.municipality_id} value={mun.municipality_id}>
                                {mun.name} {type ? `(${type.name})` : ''} - {mun.nepali_name}
                            </option>
                        );
                    })}
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ward No */}
                <Select
                    label="Ward No."
                    value={value?.wardNo || ''}
                    onChange={(e) => handleFieldChange('wardNo', e.target.value)}
                    disabled={disabled || !value?.municipality}
                >
                    <option value="">Select Ward</option>
                    {Array.from({ length: maxWards }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </Select>

                {/* Tole */}
                <Input
                    label="Tole / Street Address"
                    type="text"
                    value={value?.tole || ''}
                    onChange={(e) => handleFieldChange('tole', e.target.value)}
                    disabled={disabled}
                    placeholder="Ex: New Road"
                />
            </div>
        </div>
    );
};

export default NepalAddressSelector;
