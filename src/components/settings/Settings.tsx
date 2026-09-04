import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import {
    addCategory,
    getCategories,
    removeCategory,
} from "../../services/category_service";
import "./Settings.css";

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

function Settings() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const addCat = async () => {
        if (newCategory.trim() === "") {
            return;
        }

        await addCategory(newCategory.trim(), selectedColor);

        setNewCategory("");
        setSelectedColor(COLORS[0]);
        setCategories(await getCategories());
    };

    const removeCat = async (id: number) => {
        await removeCategory(id);
        setCategories(await getCategories());
    };

    return (
        <main className="settings-page">
            <div className="settings-glow" />

            <section className="settings-card">
                <header className="settings-header">
                    <button
                        className="settings-close"
                        onClick={() => navigate(-1)}
                        aria-label="Retour"
                    >
                        ×
                    </button>

                    <div>
                        <p className="settings-eyebrow">
                            PARAMÈTRES
                        </p>
                    </div>
                </header>

                <section className="settings-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                ORGANISATION
                            </p>

                            <h2>Catégories</h2>
                        </div>

                        <span className="section-count">
                            {categories.length}
                        </span>
                    </div>

                    <p className="section-description">
                        Utilise les catégories pour suivre le temps
                        passé sur chaque type d'activité.
                    </p>

                    {/* Add category */}
                    <div className="category-form">
                        <div className="category-input-wrapper">
                            <input
                                type="text"
                                placeholder="Nom de la catégorie"
                                value={newCategory}
                                onChange={(e) =>
                                    setNewCategory(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addCat();
                                    }
                                }}
                            />

                            <button
                                className="add-category-button"
                                onClick={addCat}
                                aria-label="Ajouter une catégorie"
                            >
                                +
                            </button>
                        </div>

                        {/* Colors */}
                        <div className="color-picker">
                            <span className="color-label">
                                Couleur
                            </span>

                            <div className="color-palette">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-option ${
                                            selectedColor === color
                                                ? "selected"
                                                : ""
                                        }`}
                                        style={{
                                            backgroundColor: color,
                                        }}
                                        onClick={() =>
                                            setSelectedColor(color)
                                        }
                                        aria-label={`Choisir la couleur ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Category list */}
                    <div className="category-list">
                        {categories.length === 0 ? (
                            <div className="empty-categories">
                                <span>○</span>
                                <p>
                                    Aucune catégorie pour le moment.
                                </p>
                            </div>
                        ) : (
                            categories.map((category) => (
                                <div
                                    className="category-item"
                                    key={category.id}
                                >
                                    <div className="category-info">
                                        <span
                                            className="category-dot"
                                            style={{
                                                backgroundColor:
                                                    category.color,
                                                boxShadow: `0 0 12px ${category.color}44`,
                                            }}
                                        />

                                        <span className="category-name">
                                            {category.name}
                                        </span>
                                    </div>

                                    <button
                                        className="delete-category"
                                        onClick={() =>
                                            removeCat(category.id)
                                        }
                                        aria-label={`Supprimer ${category.name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>   
            </section>
        </main>
    );
}

export default Settings;
