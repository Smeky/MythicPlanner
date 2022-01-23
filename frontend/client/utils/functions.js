import { POINT_CONVERSION_UNCOMPRESSED } from "constants";

export function stripToImageName(str, ext = '.jpg') {
    return str.replace(/[^a-zA-Z0-9 ]/g, '').replace(/[' ']/g, '_') + ext
}

export let convertMdtData = null
export let convertMdtPoiData = null

if (process.env.NODE_ENV === 'development') {
    const _correctPos = (x, y) => {
        return {
            x: Math.round(x * 1.195 * 10) / 10,
            y: Math.round(Math.abs(y) * 1.195 * 10) / 10
        }
    }

    convertMdtData = (mdt) => {
        const result = {
            levels: [],
            units: {}
        }
        
        for (const [id, meta] of Object.entries(mdt)) {
            result.units[meta.id] = {
                name: meta.name,
                value: meta.count || 0,
                isBoss: meta.isBoss ? true : false,
                image: stripToImageName(meta.name.toLowerCase()),
                spells: meta.spells ? Object.keys(meta.spells) : [],
                creatureType: meta.creatureType,
                level: meta.level,
                health: meta.health,
                characteristics: meta.characteristics ? Object.keys(meta.characteristics) : []
            }
        
            const PacklessUnits = []
            for (const clone of meta.clones) {
                let level = result.levels.find(l => l.id === clone.sublevel)
        
                if (!level) {
                    const l = result.levels.push({
                        id: clone.sublevel,
                        image: '',
                        packs: []
                    })
        
                    level = result.levels[l - 1]
                }
        
                if (!clone.hasOwnProperty('g')) {
                    PacklessUnits.push(clone)
                }
                else {
                    let pack = level.packs.find(p => p.id === clone.g)
            
                    if (!pack) {
                        const l = level.packs.push({
                            id: clone.g,
                            units: []
                        })
            
                        pack = level.packs[l - 1]
                    }

                    pack.patrol = Array.isArray(clone.patrol) ? clone.patrol.map(p => _correctPos(p.x, p.y)) : undefined
            
                    pack.units.push({
                        id: null,
                        unitId: meta.id.toString(),
                        ...(_correctPos(clone.x, clone.y)),
                        teeming: clone.teeming,
                        faction: clone.faction
                    })
                }
            }

            let lastPackId = 0
            for (const level of result.levels) {
                for (const pack of level.packs) {
                    if (lastPackId < pack.id) {
                        lastPackId = pack.id
                    }
                }
            }

            for (const clone of PacklessUnits) {
                let level = result.levels.find(l => l.id === clone.sublevel)
        
                if (!level) {
                    const l = result.levels.push({
                        id: clone.sublevel,
                        image: '',
                        packs: []
                    })
        
                    level = result.levels[l - 1]
                }

                const l = level.packs.push({
                    id: lastPackId += 1,
                    units: []
                })
    
                const pack = level.packs[l - 1]

                pack.patrol = Array.isArray(clone.patrol) ? clone.patrol.map(p => _correctPos(p.x, p.y)) : undefined
        
                pack.units.push({
                    id: null,
                    unitId: meta.id.toString(),
                    ...(_correctPos(clone.x, clone.y)),
                    teeming: clone.teeming,
                    faction: clone.faction
                })
            }
        }
        
        // Todo: More stable id generation (so we don't generate new ids on every metadata update)
        //          -> Solution to this could be update-specific functionality that would take the original
        //             ids and re-use them, instead of generating new ones
        let idCounter = 0
        for (const level of result.levels) {
            for (const pack of level.packs) {
                for (const unit of pack.units) {
                    unit.id = idCounter += 1
                }
            }
        }

        return result
    }

    convertMdtPoiData = mdt => {
        const _getDoorDir = dir => {
            if (dir === -1) return 'down'
            if (dir === 1) return 'up'
            if (dir === -2) return 'left'
            if (dir === 2) return 'right'
            return 'none'
        }

        const result = {
            levels: []
        }

        let doorIdCounter = 0
        for (const [levelId, pois] of Object.entries(mdt)) {
            for (const [id, poi] of Object.entries(pois)) {
                if (poi.type === 'mapLink') {
                    let level = result.levels.find(l => l.id === parseInt(levelId))

                    if (!level) {
                        const l = result.levels.push({
                            id: parseInt(levelId)
                        })

                        level = result.levels[l - 1]
                    }

                    if (!level.hasOwnProperty('doors')) {
                        level.doors = []
                    }

                    level.doors.push({
                        id: doorIdCounter++,
                        ...(_correctPos(poi.x, poi.y)),
                        target: poi.target,
                        direction: _getDoorDir(poi.direction)
                    })
                }
            }
        }

        return result
    }
}
