import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MetadataFetcher from '../MetadataFetcher';

jest.mock('axios');

describe('MetadataFetcher Component', () => {
    test('renders the form and initial state correctly', () => {
        render(<MetadataFetcher />);
        
        expect(screen.getAllByPlaceholderText('Enter URL').length).toBe(3); // Should render 3 input fields initially
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.getByText('Add Another URL')).toBeInTheDocument();
    });

    test('adds another URL input field when "Add Another URL" is clicked', () => {
        render(<MetadataFetcher />);
        
        fireEvent.click(screen.getByText('Add Another URL'));
        
        expect(screen.getAllByPlaceholderText('Enter URL').length).toBe(4); // Should add a new input field
    });

    test('displays metadata after form submission', async () => {
        const mockData = [
            { url: 'https://example.com', title: 'Example Domain', description: 'Example description', image: 'https://example.com/image.png' }
        ];
        axios.post.mockResolvedValueOnce({ data: mockData });
        
        render(<MetadataFetcher />);
        
        const input = screen.getAllByPlaceholderText('Enter URL')[0];
        fireEvent.change(input, { target: { value: 'https://example.com' } });
        fireEvent.click(screen.getByText('Submit'));
        
        await waitFor(() => {
            expect(screen.getByText('Example Domain')).toBeInTheDocument();
            expect(screen.getByText('Example description')).toBeInTheDocument();
            expect(screen.getByAltText('metadata')).toBeInTheDocument();
        });
    });

    test('displays an error message when the form submission fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Error fetching metadata'));
        
        render(<MetadataFetcher />);
        
        fireEvent.click(screen.getByText('Submit'));
        
        await waitFor(() => {
            expect(screen.getByText('Error fetching metadata')).toBeInTheDocument();
        });
    });

    test('displays a message if no description or image is available', async () => {
        const mockData = [
            { url: 'https://example.com', title: 'Example Domain' }
        ];
        axios.post.mockResolvedValueOnce({ data: mockData });
        
        render(<MetadataFetcher />);
        
        const input = screen.getAllByPlaceholderText('Enter URL')[0];
        fireEvent.change(input, { target: { value: 'https://example.com' } });
        fireEvent.click(screen.getByText('Submit'));
        
        await waitFor(() => {
            expect(screen.getByText('No description available')).toBeInTheDocument();
            expect(screen.queryByAltText('metadata')).toBeNull();
        });
    });
});
