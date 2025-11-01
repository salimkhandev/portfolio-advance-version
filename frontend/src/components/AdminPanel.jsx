'use client';
import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import axios from 'axios';
import Button from '@mui/material/Button';
import swal from 'sweetalert2';

const AdminPanel = () => {
    const [documents, setDocuments] = useState([]);
    const [isloading, setLoading] = useState(true);

    const handleDelete = async (docID) => {
        const url = `https://portfolio-backend-git-main-salimkhandevs-projects.vercel.app/delete?id=${docID}`;
        swal.fire({
            title: "Are you sure?",
            text: "You want to delete this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(url);
                    setDocuments(documents.filter(doc => doc._id !== docID));
                } catch (error) {
                    console.error("There was an error deleting the document:", error);
                    swal.fire({
                        title: "Error!",
                        text: "There was an error deleting the document.",
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    };

    const deleteAllDocuments = async () => {
        const API_URL = `https://portfolio-backend-git-main-salimkhandevs-projects.vercel.app/delete`;
        swal.fire({
            title: "Are you sure?",
            text: "You want to delete all data?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete them!",
            cancelButtonText: "No, keep them",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/all`);
                    swal.fire({
                        title: "Done!",
                        text: "All data are deleted",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                    setDocuments([]);
                } catch (error) {
                    console.error("There was an error deleting the documents:", error);
                    swal.fire({
                        title: "Error!",
                        text: "There was an error deleting the documents.",
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    };

    useEffect(() => {
        fetch('https://portfolio-backend-git-main-salimkhandevs-projects.vercel.app/admin')
            .then(response => response.json())
            .then(data => {
                setDocuments(data);
                setLoading(false);
            })
            .catch(error => console.error('Error fetching documents:', error));
    }, []);

    const bgColors = ['bg-blue-500', 'bg-green-500'];

    return (
        <div className="min-h-screen p-10 text-white submitted-forms bg-gray-900">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">Submitted Forms</h1>

                <div className="space-x-4">
                    {documents.length > 0 && (
                        <Button
                            variant="contained"
                            className="bg-red-700 hover:bg-red-800"
                            style={{ backgroundColor: '#b91c1c', color: 'white' }}
                            onClick={deleteAllDocuments}
                        >
                            Delete all records
                        </Button>
                    )}

                    <a
                        href="https://docs.google.com/document/d/115SA9LHSWySCV1MWH4seXDgSgaNbW4ri8cDE73Qwx-c/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                        View Resume
                    </a>
                </div>
            </div>

            {
                isloading ? (<SplashScreen />) :
                    <ul className="space-y-4">
                        {
                            documents.length === 0 ? (
                                <p>No documents found.</p>
                            ) : (
                                documents.map((doc, index) => (
                                    <li key={doc._id} className={`p-6 rounded-lg break-words shadow-md ${bgColors[index % bgColors.length]}`}>
                                        <span className='text-gray-900 border-black border-2 rounded-full px-3 py-1'>{index + 1}</span>
                                        <h2 className="text-2xl mt-2 font-semibold">{doc.name}</h2>
                                        <p className="text-lg"><b>Email:</b> {doc.email}</p>
                                        <p className="text-lg"><b>Message:</b> {doc.message}</p>
                                        <button className='bg-red-900 hover:bg-red-500 text-white font-bold py-2 px-2 rounded' onClick={() => { handleDelete(doc._id) }}>Delete</button>
                                    </li>
                                ))
                            )
                        }
                    </ul>
            }
        </div>
    );
};

export default AdminPanel;
