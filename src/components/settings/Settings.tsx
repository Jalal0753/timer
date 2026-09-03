import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import { addCategory, getCategories, removeCategory } from "../../services/category_service";

const COLORS = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#06B6D4",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
];

function Settings(){
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategory, setNewCategory] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);


    useEffect(() =>{
        getCategories().then(setCategories); //on attend qu'on obtienne les catégories et on les met dans categories
    },[]);

    const addCat = async () => {
    if(newCategory.trim() === ""){
        return;
    }

    await addCategory(newCategory, selectedColor);

    setNewCategory("");
    setSelectedColor(COLORS[0]);

    setCategories(await getCategories());
    }

    const removeCat = async (id: number) => {
        await removeCategory(id);
        setCategories(await getCategories());
        }


    return (
    <div>
        <button onClick={() => navigate(-1)}>
            X
        </button>

        <h1>Catégories</h1>

        <div>
            <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
            />

            <button onClick={addCat}>
                Ajouter
            </button>
        </div>

        <div className="color-palette">
            {COLORS.map((color) => (
                <button
                    key={color}
                    type="button"
                    className={`color-option ${
                        selectedColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                />
            ))}
        </div>

        <div>
            <h2>Mes catégories</h2>

            {categories.map((category) => (
                <div key={category.id}>
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: category.color,
                        }}
                    />

                    <span>{category.name}</span>

                    <button onClick={() => removeCat(category.id)}>
                        Supprimer
                    </button>
                </div>
            ))}
        </div>
    </div>
);
}

export default Settings;