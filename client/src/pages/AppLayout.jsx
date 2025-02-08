import React from 'react'
import { Outlet } from "react-router-dom";
import Sidebar from '../components/Sidebar';

function AppLayout() {
    return (
        <Sidebar>
            <Outlet />
        </Sidebar>
    )
}

export default AppLayout
