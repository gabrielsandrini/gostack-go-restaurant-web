import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      const { image, name, description, price } = food;
      try {
        const response = await api.post('/foods', {
          image,
          name,
          description,
          price,
          available: true,
        });

        setFoods(f => {
          f.push(response.data);
          return f;
        });
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      // UPDATE A FOOD PLATE ON THE API
      const { id, available } = editingFood;
      const { image, name, price, description } = food;
      const response = await api.put(`/foods/${id}`, {
        id,
        available,
        image,
        name,
        price,
        description,
      });

      const index = foods.findIndex(searchFood => searchFood.id === id);
      setFoods(f => {
        f.splice(index, 1, response.data);
        return [...f];
      });
    },
    [editingFood, foods],
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      // DELETE A FOOD PLATE FROM THE API
      await api.delete(`foods/${id}`);

      const index = foods.findIndex(food => food.id === id);
      foods.splice(index, 1);
      setFoods([...foods]);
    },
    [foods],
  );

  const toggleModal = useCallback((): void => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback((food: IFoodPlate): void => {
    // SET THE CURRENT EDITING FOOD ID IN THE STATE
    setEditingFood(food);
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        toggleModal={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              toggleEditModal={toggleEditModal}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
