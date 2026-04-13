import { useEffect, useState } from 'react'
import supabase from '../utils/supabase-client.js'

export default function TextUploader() {
  const [menuList , setMenuList] = useState([])
  const [newMenu, setNewMenu] = useState("")
  const [setNum, setSetNum] = useState(1)
  const [errorMessage, setErrorMessage] = useState("")
  
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setErrorMessage("")
      const { data, error } = await supabase.from("FoodMenu").select("*")
      if (error) {
        console.log("Error fetching menu:", error)
        setErrorMessage(error.message || 'Error fetching menu')
        return
      }
      setMenuList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.log('Error fetching menu:', e)
      setErrorMessage(e instanceof Error ? e.message : 'Error fetching menu')
    }
  }

 const addMenu = async () => {
   setErrorMessage("")
    const cleanedName = newMenu.trim()
    const parsedSetNum = Number(setNum)

    if (!cleanedName) {
      setErrorMessage('Menu name is required')
      return
    }

    // Keep it simple: allow 1-4 by default (matches your ImageUploader sets).
    if (!Number.isInteger(parsedSetNum) || parsedSetNum < 1 || parsedSetNum > 4) {
      setErrorMessage('set_num must be an integer from 1 to 4')
      return
    }

    try {
      const newMenuData = {
        set_name: cleanedName,
        set_num: parsedSetNum,
      }

      // Ensure we get the inserted row back; otherwise `data` may be null and crash rendering.
      const { data, error } = await supabase
        .from("FoodMenu")
        .insert([newMenuData])
        .select('*')
        .single()

      if (error) {
        console.log("Error adding menu:", error)
        setErrorMessage(error.message || 'Error adding menu')
        return
      }

      if (!data) {
        setErrorMessage('Insert succeeded but no row was returned')
        return
      }

      setMenuList((prev) => [...prev, data])
      setNewMenu("")
      setSetNum(1)
    } catch (e) {
      console.log('Error adding menu:', e)
      setErrorMessage(e instanceof Error ? e.message : 'Error adding menu')
    }
  }


  return (
    <div className='file-upload'>
        <div>
            Set1 Name:
        </div>
        <div>
            <input
                type="text"
                placeholder="Enter a new menu"
                value={newMenu}
                onChange={(e) => setNewMenu(e.target.value)}
            />
          <input
            type="number"
            min={1}
            max={4}
            value={setNum}
            onChange={(e) => setSetNum(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ width: 80, marginLeft: 8 }}
            aria-label="Set number"
          />
            <button onClick={addMenu}>Add Menu Item</button>
        </div>
        {!!errorMessage && (
          <div className='upload-label' style={{ color: 'crimson' }}>
            {errorMessage}
          </div>
        )}
        <ul>
            {menuList.map((menu) => (
                menu ? (
                  <li key={menu.id ?? `${menu.set_name}-${menu.set_num}`}>
                      <p> {menu.set_name} </p>
                      <p> Set {menu.set_num} </p>
                  </li>
                ) : null
            ))}
        </ul>
    </div>
  )
}
