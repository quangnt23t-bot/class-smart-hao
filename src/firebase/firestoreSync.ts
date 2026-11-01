import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { QuizQuestion, ClassRoom, Student, ParentGuardian } from '../types';

/**
 * Service to sync and interact with Cloud Firestore collections
 */
export const FirestoreService = {
  // Questions Bank
  async saveQuestion(question: QuizQuestion): Promise<void> {
    const path = `questions/${question.id}`;
    try {
      await setDoc(doc(db, 'questions', question.id), question);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async saveQuestionsBulk(questions: QuizQuestion[]): Promise<void> {
    for (const q of questions) {
      await this.saveQuestion(q);
    }
  },

  async deleteQuestion(questionId: string): Promise<void> {
    const path = `questions/${questionId}`;
    try {
      await deleteDoc(doc(db, 'questions', questionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async getQuestions(): Promise<QuizQuestion[]> {
    const path = 'questions';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ ...(d.data() as QuizQuestion), id: d.id }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  // Classes
  async saveClass(cls: ClassRoom): Promise<void> {
    const path = `classes/${cls.id}`;
    try {
      await setDoc(doc(db, 'classes', cls.id), cls);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getClasses(): Promise<ClassRoom[]> {
    const path = 'classes';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ ...(d.data() as ClassRoom), id: d.id }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  },

  // Guardians
  async saveGuardian(guardian: ParentGuardian): Promise<void> {
    const path = `guardians/${guardian.id}`;
    try {
      await setDoc(doc(db, 'guardians', guardian.id), guardian);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getGuardians(): Promise<ParentGuardian[]> {
    const path = 'guardians';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ ...(d.data() as ParentGuardian), id: d.id }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }
};
